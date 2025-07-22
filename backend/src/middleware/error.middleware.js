// src/middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error for debugging, especially for server errors
  if (err.statusCode === 500) {
    console.error('ERROR 💥', err);
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err.message,
    // Optionally include stack in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;