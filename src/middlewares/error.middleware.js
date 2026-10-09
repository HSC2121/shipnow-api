
import { AppError } from "../errors/app.error.js";
import logger from "../config/logger.config.js";

export const errorHandler = (err, req, res, next) => {
  const context = {
    method: req.method,
    path: req.originalUrl,
    errorCode: err.errorCode,
  };

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, {
        ...context,
        statusCode: err.statusCode,
        stack: err.stack,
      });
    } else {
      logger.warning(err.message, {
        ...context,
        statusCode: err.statusCode,
      });
    }

    return res.status(err.statusCode).json({
      status: "error",
      errorCode: err.errorCode,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  logger.error("Unexpected server error", {
    ...context,
    error: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    status: "error",
    errorCode: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
    message: "Internal server error",
  });
};
