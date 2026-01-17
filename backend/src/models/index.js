const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Inițializare Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Import modele
const User = require('./User')(sequelize);
const Activity = require('./Activity')(sequelize);
const Feedback = require('./Feedback')(sequelize);

// Definire relații
// User -> Activities (1:N)
User.hasMany(Activity, {
  foreignKey: 'teacherId',
  as: 'activities'
});
Activity.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher'
});

// Activity -> Feedback (1:N)
Activity.hasMany(Feedback, {
  foreignKey: 'activityId',
  as: 'feedbacks'
});
Feedback.belongsTo(Activity, {
  foreignKey: 'activityId',
  as: 'activity'
});

// Funcție pentru sincronizare/inițializare DB
const initializeDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexiune la baza de date stabilită cu succes.');
    
    // Sync modele cu baza de date
    // alter: true actualizează schema fără a șterge datele
    await sequelize.sync({ alter: true });
    console.log('✅ Modele sincronizate cu baza de date.');
    
    return true;
  } catch (error) {
    console.error('❌ Eroare la conectarea la baza de date:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  User,
  Activity,
  Feedback,
  initializeDatabase
};
