const { body, param, query, validationResult } = require('express-validator');

// Middleware pentru a verifica erorile de validare
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validări pentru autentificare
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Adresa de email nu este validă')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Parola trebuie să aibă cel puțin 6 caractere'),
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Numele trebuie să aibă între 2 și 255 caractere'),
  body('role')
    .isIn(['teacher', 'student'])
    .withMessage('Rolul trebuie să fie teacher sau student')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Adresa de email nu este validă')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Parola este obligatorie')
];

// Validări pentru activități
const createActivityValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Titlul trebuie să aibă între 3 și 255 caractere'),
  body('description')
    .optional()
    .trim(),
  body('duration')
    .toInt()
    .isInt({ min: 5, max: 480 })
    .withMessage('Durata trebuie să fie între 5 și 480 minute')
];

const updateActivityValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Titlul trebuie să aibă între 3 și 255 caractere'),
  body('description')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive trebuie să fie boolean')
];

const joinActivityValidation = [
  body('accessCode')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('Codul de acces trebuie să aibă 6 caractere')
    .toUpperCase()
];

// Validări pentru feedback
const createFeedbackValidation = [
  body('activityId')
    .isInt({ min: 1 })
    .withMessage('ID-ul activității nu este valid'),
  body('feedbackType')
    .isIn(['happy', 'sad', 'surprised', 'confused'])
    .withMessage('Tipul de feedback nu este valid')
];

// Validare ID parametru
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID-ul nu este valid')
];

const activityIdParamValidation = [
  param('activityId')
    .isInt({ min: 1 })
    .withMessage('ID-ul activității nu este valid')
];

// Validare query status
const statusQueryValidation = [
  query('status')
    .optional()
    .isIn(['active', 'expired', 'all'])
    .withMessage('Status-ul trebuie să fie active, expired sau all')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createActivityValidation,
  updateActivityValidation,
  joinActivityValidation,
  createFeedbackValidation,
  idParamValidation,
  activityIdParamValidation,
  statusQueryValidation
};
