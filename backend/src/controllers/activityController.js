const { Op } = require('sequelize');
const { Activity, Feedback, User, sequelize } = require('../models');
const { generateAccessCode } = require('../utils/codeGenerator');

/**
 * Controller pentru activități
 */
const activityController = {
  /**
   * Obține toate activitățile profesorului
   * GET /api/activities
   */
  getAll: async (req, res, next) => {
    try {
      const { status = 'all' } = req.query;
      const teacherId = req.user.id;

      // Construiește condiția where
      let whereCondition = { teacherId };
      const now = new Date();

      if (status === 'active') {
        whereCondition.isActive = true;
        whereCondition.expiresAt = { [Op.gt]: now };
      } else if (status === 'expired') {
        whereCondition[Op.or] = [
          { isActive: false },
          { expiresAt: { [Op.lte]: now } }
        ];
      }

      const activities = await Activity.findAll({
        where: whereCondition,
        include: [
          {
            model: Feedback,
            as: 'feedbacks',
            attributes: ['id', 'feedbackType', 'timestamp']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Adaugă statistici pentru fiecare activitate
      const activitiesWithStats = activities.map(activity => {
        const feedbacks = activity.feedbacks || [];
        const stats = {
          total: feedbacks.length,
          happy: feedbacks.filter(f => f.feedbackType === 'happy').length,
          sad: feedbacks.filter(f => f.feedbackType === 'sad').length,
          surprised: feedbacks.filter(f => f.feedbackType === 'surprised').length,
          confused: feedbacks.filter(f => f.feedbackType === 'confused').length
        };

        return {
          ...activity.toJSON(),
          stats,
          isExpired: activity.isExpired(),
          remainingTime: activity.getRemainingTime()
        };
      });

      res.json({
        success: true,
        activities: activitiesWithStats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Creează o activitate nouă
   * POST /api/activities
   */
  create: async (req, res, next) => {
    try {
      const { title, description, duration } = req.body;
      const teacherId = req.user.id;

      // Generează cod de acces unic
      let accessCode;
      let exists = true;
      while (exists) {
        accessCode = generateAccessCode();
        const existing = await Activity.findOne({ where: { accessCode } });
        exists = !!existing;
      }

      // Calculează timpii de start și expirare
      const startsAt = new Date();
      const expiresAt = new Date(startsAt);
      expiresAt.setMinutes(expiresAt.getMinutes() + (duration || 60));

      const activity = await Activity.create({
        teacherId,
        title,
        description,
        duration: duration || 60,
        accessCode,
        startsAt,
        expiresAt
      });

      res.status(201).json({
        success: true,
        message: 'Activitate creată cu succes',
        activity: {
          ...activity.toJSON(),
          isExpired: activity.isExpired(),
          remainingTime: activity.getRemainingTime()
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obține o activitate specifică cu statistici
   * GET /api/activities/:id
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const teacherId = req.user.id;

      const activity = await Activity.findOne({
        where: { id, teacherId },
        include: [
          {
            model: Feedback,
            as: 'feedbacks',
            attributes: ['id', 'feedbackType', 'timestamp', 'createdAt']
          }
        ]
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită'
        });
      }

      // Calculează statistici
      const feedbacks = activity.feedbacks || [];
      const stats = {
        total: feedbacks.length,
        happy: feedbacks.filter(f => f.feedbackType === 'happy').length,
        sad: feedbacks.filter(f => f.feedbackType === 'sad').length,
        surprised: feedbacks.filter(f => f.feedbackType === 'surprised').length,
        confused: feedbacks.filter(f => f.feedbackType === 'confused').length
      };

      res.json({
        success: true,
        activity: {
          ...activity.toJSON(),
          isExpired: activity.isExpired(),
          remainingTime: activity.getRemainingTime()
        },
        feedbackStats: stats
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizează o activitate
   * PUT /api/activities/:id
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, isActive } = req.body;
      const teacherId = req.user.id;

      const activity = await Activity.findOne({
        where: { id, teacherId }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită'
        });
      }

      // Actualizează câmpurile
      if (title !== undefined) activity.title = title;
      if (description !== undefined) activity.description = description;
      if (isActive !== undefined) activity.isActive = isActive;

      await activity.save();

      res.json({
        success: true,
        message: 'Activitate actualizată cu succes',
        activity: {
          ...activity.toJSON(),
          isExpired: activity.isExpired(),
          remainingTime: activity.getRemainingTime()
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Șterge o activitate
   * DELETE /api/activities/:id
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const teacherId = req.user.id;

      const activity = await Activity.findOne({
        where: { id, teacherId }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită'
        });
      }

      // Șterge feedback-urile asociate
      await Feedback.destroy({ where: { activityId: id } });
      
      // Șterge activitatea
      await activity.destroy();

      res.json({
        success: true,
        message: 'Activitate ștearsă cu succes'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Alătură-te unei activități (pentru studenți)
   * POST /api/activities/join
   */
  join: async (req, res, next) => {
    try {
      const { accessCode } = req.body;

      // Verifică dacă există un token în header (utilizator autentificat)
      const authHeader = req.headers.authorization;
      if (authHeader) {
        // Dacă e autentificat, verifică dacă este profesor
        try {
          const token = authHeader.split(' ')[1];
          const decoded = require('jsonwebtoken').verify(token, require('../config/jwt').secret);
          
          if (decoded.role === 'teacher') {
            return res.status(403).json({
              success: false,
              message: 'Profesorii nu pot da join la activități. Această funcționalitate este doar pentru studenți.'
            });
          }
        } catch (err) {
          // Token invalid, continuăm ca utilizator neautentificat
        }
      }

      const activity = await Activity.findOne({
        where: { 
          accessCode: accessCode.toUpperCase(),
          isActive: true
        },
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'fullName']
          }
        ]
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Cod de acces incorect sau activitatea nu este activă'
        });
      }

      // Verifică dacă activitatea a expirat
      if (activity.isExpired()) {
        return res.status(400).json({
          success: false,
          message: 'Activitatea a expirat'
        });
      }

      res.json({
        success: true,
        activity: {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          teacher: activity.teacher?.fullName,
          remainingTime: activity.getRemainingTime(),
          expiresAt: activity.expiresAt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Oprește o activitate
   * POST /api/activities/:id/stop
   */
  stop: async (req, res, next) => {
    try {
      const { id } = req.params;
      const teacherId = req.user.id;

      const activity = await Activity.findOne({
        where: { id, teacherId }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită'
        });
      }

      activity.isActive = false;
      activity.expiresAt = new Date();
      await activity.save();

      res.json({
        success: true,
        message: 'Activitate oprită cu succes',
        activity: activity.toJSON()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obține statisticile unei activități
   * GET /api/activities/:id/stats
   */
  getStats: async (req, res, next) => {
    try {
      const { id } = req.params;
      const teacherId = req.user.id;

      const activity = await Activity.findOne({
        where: { id, teacherId },
        include: [{
          model: Feedback,
          as: 'feedbacks'
        }]
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activitate negăsită'
        });
      }

      // Calculează statisticile
      const feedbacks = activity.feedbacks || [];
      const stats = {
        total: feedbacks.length,
        happy: feedbacks.filter(f => f.feedbackType === 'happy').length,
        sad: feedbacks.filter(f => f.feedbackType === 'sad').length,
        surprised: feedbacks.filter(f => f.feedbackType === 'surprised').length,
        confused: feedbacks.filter(f => f.feedbackType === 'confused').length
      };

      // Calculează procentaje
      const percentages = {
        happy: stats.total > 0 ? Math.round((stats.happy / stats.total) * 100) : 0,
        sad: stats.total > 0 ? Math.round((stats.sad / stats.total) * 100) : 0,
        surprised: stats.total > 0 ? Math.round((stats.surprised / stats.total) * 100) : 0,
        confused: stats.total > 0 ? Math.round((stats.confused / stats.total) * 100) : 0
      };

      res.json({
        success: true,
        activity: {
          id: activity.id,
          title: activity.title,
          accessCode: activity.accessCode,
          isActive: activity.isActive,
          isExpired: activity.isExpired(),
          remainingTime: activity.getRemainingTime()
        },
        stats,
        percentages
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = activityController;
