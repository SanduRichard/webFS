const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Adresa de email nu este validă'
        }
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
      validate: {
        len: {
          args: [2, 255],
          msg: 'Numele trebuie să aibă între 2 și 255 caractere'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('teacher', 'student'),
      allowNull: false,
      defaultValue: 'student'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
        }
      }
    }
  });

  // Instance method pentru verificare parolă
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  // Method pentru a returna user fără date sensibile
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.passwordHash;
    return values;
  };

  return User;
};
