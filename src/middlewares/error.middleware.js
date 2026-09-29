import { AppError } from "../errors/app.error.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      errorCode: err.errorCode,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    errorCode: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
    message: "Internal server error",
  });
};