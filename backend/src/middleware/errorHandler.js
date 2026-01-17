/**
 * Middleware pentru gestionarea erorilor
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Erori de validare Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Eroare de validare',
      errors
    });
  }

  // Erori de constraint unic Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(400).json({
      success: false,
      message: `Valoarea pentru ${field} există deja`
    });
  }

  // Erori de conexiune la baza de date
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Serviciul bazei de date nu este disponibil'
    });
  }

  // Eroare generică
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Eroare internă de server';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware pentru rute inexistente
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} nu a fost găsită`
  });
};

module.exports = {
  errorHandler,
  notFound
};
