const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware, teacherOnly } = require('../middleware/auth');
const {
  validate,
  createFeedbackValidation,
  activityIdParamValidation
} = require('../utils/validators');

/**
 * @route   POST /api/feedback
 * @desc    Trimite feedback pentru o activitate
 * @access  Public (studenții nu au nevoie de autentificare)
 */
router.post(
  '/',
  createFeedbackValidation,
  validate,
  feedbackController.create
);

/**
 * @route   GET /api/feedback/:activityId
 * @desc    Obține tot feedback-ul pentru o activitate
 * @access  Private (Teacher)
 */
router.get(
  '/:activityId',
  authMiddleware,
  teacherOnly,
  activityIdParamValidation,
  validate,
  feedbackController.getByActivity
);

/**
 * @route   GET /api/feedback/:activityId/timeline
 * @desc    Obține timeline-ul de feedback pentru o activitate
 * @access  Private (Teacher)
 */
router.get(
  '/:activityId/timeline',
  authMiddleware,
  teacherOnly,
  activityIdParamValidation,
  validate,
  feedbackController.getTimeline
);

/**
 * @route   GET /api/feedback/:activityId/stats
 * @desc    Obține statisticile pentru o activitate
 * @access  Public
 */
router.get(
  '/:activityId/stats',
  activityIdParamValidation,
  validate,
  feedbackController.getStats
);

module.exports = router;
