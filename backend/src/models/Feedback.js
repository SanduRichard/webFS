const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Feedback = sequelize.define('Feedback', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'activity_id',
      references: {
        model: 'activities',
        key: 'id'
      }
    },
    feedbackType: {
      type: DataTypes.ENUM('happy', 'sad', 'surprised', 'confused'),
      allowNull: false,
      field: 'feedback_type'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'feedback',
    timestamps: true,
    underscored: true,
    updatedAt: false // Feedback nu se actualizează, doar se creează
  });

  return Feedback;
};
