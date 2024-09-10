// Import App Error Utils
const AppError = require('./../utils/appError');

// Handle Sequelize Validation Errors
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((e) => e.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle Sequelize Unique Constraint Errors
const handleSequelizeUniqueConstraintError = (err) => {
  // Extract the duplicate field value from the error message
  const match = err.message.match(/(["'])(\\?.)*?\1/);
  const value = match ? match[0] : 'unknown';

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle Sequelize Database Errors
const handleSequelizeDatabaseError = () =>
  new AppError('Database operation failed. Please try again later.', 500);

// Handle JWT Errors
const handleInvalidTokenError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleExpiredTokenError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleDevErrors = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const handleProdErrors = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    handleDevErrors(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // Sequelize specific errors
    if (error.name === 'SequelizeValidationError')
      error = handleSequelizeValidationError(error);
    if (error.name === 'SequelizeUniqueConstraintError')
      error = handleSequelizeUniqueConstraintError(error);
    if (error.name === 'SequelizeDatabaseError')
      error = handleSequelizeDatabaseError(error);
    if (error.name === 'JsonWebTokenError') error = handleInvalidTokenError();
    if (error.name === 'TokenExpiredError') error = handleExpiredTokenError();

    handleProdErrors(error, req, res);
  }
};
