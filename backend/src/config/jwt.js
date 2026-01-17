module.exports = {
  secret: process.env.JWT_SECRET || 'default_secret_key_change_me',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256'
};
