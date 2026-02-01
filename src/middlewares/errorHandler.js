import { logError } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  logError(err, req);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

export default errorHandler;