const { Op } = require('sequelize');
const { Feedback, Activity, sequelize } = require('../models');

/**
 * Controller pentru feedback
 */
const feedbackController = {
  /**
   * Trimite feedback pentru o activitate
   * POST /api/feedback
   */
  create: async (req, res, next) => {
    try {
      const { activityId, feedbackType } = req.body;

      // Verifică dacă activitatea există și este activă
      const activity = await Activity.findByPk(activityId);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită'
        });
      }

      if (!activity.isActive || activity.isExpired()) {
        return res.status(400).json({
          success: false,
          message: 'Activitatea nu mai acceptă feedback'
        });
      }

      // Creează feedback-ul
      const feedback = await Feedback.create({
        activityId,
        feedbackType,
        timestamp: new Date()
      });

      // Calculează statisticile actualizate
      const stats = await feedbackController.calculateStats(activityId);

      res.status(201).json({
        success: true,
        message: 'Feedback trimis cu succes',
        feedback: feedback.toJSON(),
        stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obține tot feedback-ul pentru o activitate
   * GET /api/feedback/:activityId
   */
  getByActivity: async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const teacherId = req.user.id;

      // Verifică dacă profesorul deține activitatea
      const activity = await Activity.findOne({
        where: { id: activityId, teacherId }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită sau nu aveți acces'
        });
      }

      const feedbacks = await Feedback.findAll({
        where: { activityId },
        order: [['timestamp', 'DESC']]
      });

      const stats = await feedbackController.calculateStats(activityId);

      res.json({
        success: true,
        feedback: feedbacks,
        stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obține timeline-ul de feedback pentru o activitate
   * GET /api/feedback/:activityId/timeline
   */
  getTimeline: async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const teacherId = req.user.id;

      // Verifică dacă profesorul deține activitatea
      const activity = await Activity.findOne({
        where: { id: activityId, teacherId }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită sau nu aveți acces'
        });
      }

      // Obține feedback-ul grupat pe intervale de 1 minut
      const feedbacks = await Feedback.findAll({
        where: { activityId },
        attributes: [
          'feedbackType',
          [sequelize.fn('date_trunc', 'minute', sequelize.col('timestamp')), 'timeSlot'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['feedbackType', 'timeSlot'],
        order: [[sequelize.literal('"timeSlot"'), 'ASC']],
        raw: true
      });

      // Transformă datele pentru grafic
      const timelineMap = new Map();
      
      feedbacks.forEach(item => {
        const timeKey = new Date(item.timeSlot).toISOString();
        if (!timelineMap.has(timeKey)) {
          timelineMap.set(timeKey, {
            timestamp: timeKey,
            happy: 0,
            sad: 0,
            surprised: 0,
            confused: 0
          });
        }
        timelineMap.get(timeKey)[item.feedbackType] = parseInt(item.count);
      });

      const timeline = Array.from(timelineMap.values()).sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      res.json({
        success: true,
        timeline
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obține statisticile live pentru o activitate
   * GET /api/feedback/:activityId/stats
   */
  getStats: async (req, res, next) => {
    try {
      const { activityId } = req.params;

      const activity = await Activity.findByPk(activityId);
      
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită'
        });
      }

      const stats = await feedbackController.calculateStats(activityId);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Funcție helper pentru calcularea statisticilor
   */
  calculateStats: async (activityId) => {
    const result = await Feedback.findAll({
      where: { activityId },
      attributes: [
        'feedbackType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['feedbackType'],
      raw: true
    });

    const stats = {
      total: 0,
      happy: 0,
      sad: 0,
      surprised: 0,
      confused: 0
    };

    result.forEach(item => {
      const count = parseInt(item.count);
      stats[item.feedbackType] = count;
      stats.total += count;
    });

    // Calculează procente
    if (stats.total > 0) {
      stats.happyPercent = Math.round((stats.happy / stats.total) * 100);
      stats.sadPercent = Math.round((stats.sad / stats.total) * 100);
      stats.surprisedPercent = Math.round((stats.surprised / stats.total) * 100);
      stats.confusedPercent = Math.round((stats.confused / stats.total) * 100);
    } else {
      stats.happyPercent = 0;
      stats.sadPercent = 0;
      stats.surprisedPercent = 0;
      stats.confusedPercent = 0;
    }

    return stats;
  }
};

module.exports = feedbackController;
