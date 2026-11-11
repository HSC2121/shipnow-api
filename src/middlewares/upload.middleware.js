
import multer from "multer";

import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";
import logger from "../config/logger.config.js";

export const handleUpload = (middleware) => {
  return (req, res, next) => {
    middleware(req, res, (error) => {
      if (!error) return next();

      let definition = ERROR_DICTIONARY.FILE_SAVE_FAILED;

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          definition = ERROR_DICTIONARY.FILE_TOO_LARGE;
        } else if (
          error.code === "LIMIT_UNEXPECTED_FILE" ||
          error.code === "LIMIT_FILE_COUNT"
        ) {
          definition = ERROR_DICTIONARY.INVALID_FILE_FIELD;
        }
      } else if (error.message === "Invalid file type") {
        definition = ERROR_DICTIONARY.INVALID_FILE_TYPE;
      }

      logger.warning("File upload rejected", {
        field: error.field,
        multerCode: error.code,
        reason: error.message,
      });

      next(new AppError(definition));
    });
  };
};
