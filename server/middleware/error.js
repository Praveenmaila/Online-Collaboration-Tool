export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Default error status and message
  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong on the server';
  
  return res.status(status).json({
    success: false,
    status,
    message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};