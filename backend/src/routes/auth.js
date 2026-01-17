const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const {
  validate,
  registerValidation,
  loginValidation
} = require('../utils/validators');

/**
 * @route   POST /api/auth/register
 * @desc    Înregistrare utilizator nou
 * @access  Public
 */
router.post('/register', registerValidation, validate, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Autentificare utilizator
 * @access  Public
 */
router.post('/login', loginValidation, validate, authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Obține datele utilizatorului curent
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Actualizează profilul utilizatorului
 * @access  Private
 */
router.put('/me', authMiddleware, authController.updateMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Deconectare utilizator
 * @access  Private
 */
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
