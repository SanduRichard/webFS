const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

/**
 * Middleware pentru autentificare JWT
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Obține token-ul din header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autentificare lipsă'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verifică token-ul
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Verifică dacă utilizatorul există
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilizator negăsit'
      });
    }

    // Adaugă utilizatorul la request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirat'
      });
    }

    next(error);
  }
};

/**
 * Middleware pentru verificare rol profesor
 */
const teacherOnly = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Acces permis doar profesorilor'
    });
  }
  next();
};

/**
 * Middleware pentru verificare rol student
 */
const studentOnly = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Acces permis doar studenților'
    });
  }
  next();
};

/**
 * Middleware opțional de autentificare (nu returnează eroare dacă nu e autentificat)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await User.findByPk(decoded.id);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      };
    }

    next();
  } catch (error) {
    // Ignoră erorile de autentificare în modul opțional
    next();
  }
};

module.exports = {
  authMiddleware,
  teacherOnly,
  studentOnly,
  optionalAuth
};
