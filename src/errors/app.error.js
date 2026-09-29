export class AppError extends Error {
  constructor(errorDefinition) {
    super(errorDefinition.message);

    this.name = "AppError";
    this.errorCode = errorDefinition.errorCode;
    this.statusCode = errorDefinition.statusCode;
    this.isOperational = true;

    Error.captureStackTrace?.(this, this.constructor);
  }
}