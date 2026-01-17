const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

/**
 * Controller pentru autentificare
 */
const authController = {
  /**
   * Înregistrare utilizator nou
   * POST /api/auth/register
   */
  register: async (req, res, next) => {
    try {
      const { email, password, fullName, role } = req.body;

      // Verifică dacă email-ul există deja
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Adresa de email este deja înregistrată'
        });
      }

      // Creează utilizatorul
      const user = await User.create({
        email,
        passwordHash: password,
        fullName,
        role
      });

      // Generează token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn, algorithm: jwtConfig.algorithm }
      );

      res.status(201).json({
        success: true,
        message: 'Cont creat cu succes',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Autentificare utilizator
   * POST /api/auth/login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Caută utilizatorul
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email sau parolă incorectă'
        });
      }

      // Verifică parola
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email sau parolă incorectă'
        });
      }

      // Generează token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn, algorithm: jwtConfig.algorithm }
      );

      res.json({
        success: true,
        message: 'Autentificare reușită',
        token,
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obține datele utilizatorului curent
   * GET /api/auth/me
   */
  getMe: async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizator negăsit'
        });
      }

      res.json({
        success: true,
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizează profilul utilizatorului
   * PUT /api/auth/me
   */
  updateMe: async (req, res, next) => {
    try {
      const { fullName, password } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilizator negăsit'
        });
      }

      // Actualizează câmpurile
      if (fullName) user.fullName = fullName;
      if (password) user.passwordHash = password;

      await user.save();

      res.json({
        success: true,
        message: 'Profil actualizat cu succes',
        user: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
