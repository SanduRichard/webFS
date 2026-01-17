const { DataTypes } = require('sequelize');
const { generateAccessCode } = require('../utils/codeGenerator');

module.exports = (sequelize) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'teacher_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [3, 255],
          msg: 'Titlul trebuie să aibă între 3 și 255 caractere'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    accessCode: {
      type: DataTypes.STRING(6),
      allowNull: false,
      unique: true,
      field: 'access_code'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        min: {
          args: [5],
          msg: 'Durata minimă este de 5 minute'
        },
        max: {
          args: [480],
          msg: 'Durata maximă este de 480 minute (8 ore)'
        }
      }
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'starts_at'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'activities',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (activity) => {
        // Generează cod unic de acces
        if (!activity.accessCode) {
          let code;
          let exists = true;
          while (exists) {
            code = generateAccessCode();
            const existing = await Activity.findOne({ where: { accessCode: code } });
            exists = !!existing;
          }
          activity.accessCode = code;
        }
        
        // Setează timpul de start și expirare
        if (!activity.startsAt) {
          activity.startsAt = new Date();
        }
        if (!activity.expiresAt && activity.duration) {
          const expiresAt = new Date(activity.startsAt);
          expiresAt.setMinutes(expiresAt.getMinutes() + activity.duration);
          activity.expiresAt = expiresAt;
        }
      }
    }
  });

  // Instance method pentru verificare dacă activitatea este activă
  Activity.prototype.isExpired = function() {
    if (!this.isActive) return true;
    if (!this.expiresAt) return false;
    return new Date() > new Date(this.expiresAt);
  };

  // Instance method pentru timpul rămas
  Activity.prototype.getRemainingTime = function() {
    if (this.isExpired()) return 0;
    const now = new Date();
    const expires = new Date(this.expiresAt);
    return Math.max(0, Math.floor((expires - now) / 1000));
  };

  return Activity;
};
