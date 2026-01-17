const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authMiddleware, teacherOnly } = require('../middleware/auth');
const {
  validate,
  createActivityValidation,
  updateActivityValidation,
  joinActivityValidation,
  idParamValidation,
  statusQueryValidation
} = require('../utils/validators');

/**
 * @route   GET /api/activities
 * @desc    Obține toate activitățile profesorului
 * @access  Private (Teacher)
 */
router.get(
  '/',
  authMiddleware,
  teacherOnly,
  statusQueryValidation,
  validate,
  activityController.getAll
);

/**
 * @route   POST /api/activities
 * @desc    Creează o activitate nouă
 * @access  Private (Teacher)
 */
router.post(
  '/',
  authMiddleware,
  teacherOnly,
  createActivityValidation,
  validate,
  activityController.create
);

/**
 * @route   GET /api/activities/:id
 * @desc    Obține o activitate specifică
 * @access  Private (Teacher)
 */
router.get(
  '/:id',
  authMiddleware,
  teacherOnly,
  idParamValidation,
  validate,
  activityController.getById
);

/**
 * @route   PUT /api/activities/:id
 * @desc    Actualizează o activitate
 * @access  Private (Teacher)
 */
router.put(
  '/:id',
  authMiddleware,
  teacherOnly,
  idParamValidation,
  updateActivityValidation,
  validate,
  activityController.update
);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Șterge o activitate
 * @access  Private (Teacher)
 */
router.delete(
  '/:id',
  authMiddleware,
  teacherOnly,
  idParamValidation,
  validate,
  activityController.delete
);

/**
 * @route   POST /api/activities/join
 * @desc    Alătură-te unei activități (pentru studenți)
 * @access  Public
 */
router.post(
  '/join',
  joinActivityValidation,
  validate,
  activityController.join
);

/**
 * @route   POST /api/activities/:id/stop
 * @desc    Oprește o activitate
 * @access  Private (Teacher)
 */
router.post(
  '/:id/stop',
  authMiddleware,
  teacherOnly,
  idParamValidation,
  validate,
  activityController.stop
);

/**
 * @route   GET /api/activities/:id/stats
 * @desc    Obține statisticile unei activități
 * @access  Private (Teacher)
 */
router.get(
  '/:id/stats',
  authMiddleware,
  teacherOnly,
  idParamValidation,
  validate,
  activityController.getStats
);

module.exports = router;
