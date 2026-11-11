
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import { fileTypeFromFile } from "file-type";

import { UploadsRepository } from "../repositories/uploads.repository.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";
import logger from "../config/logger.config.js";

import {
  DOCUMENT_TYPES,
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_SIZE,
} from "../constants/index.js";

const repository = new UploadsRepository();

const USER_DOCUMENT_TYPES = [
  DOCUMENT_TYPES.IDENTITY,
  DOCUMENT_TYPES.PASSPORT,
  DOCUMENT_TYPES.ADDRESS,
];

export class UploadsService {
  validateId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ID);
    }
  }

  validateFile(file) {
    if (!file) {
      throw new AppError(ERROR_DICTIONARY.FILE_REQUIRED);
    }

    if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_FILE_TYPE);
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new AppError(ERROR_DICTIONARY.FILE_TOO_LARGE);
    }
  }

  validateDocumentType(documentType) {
    if (!USER_DOCUMENT_TYPES.includes(documentType)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_DOCUMENT_TYPE);
    }
  }

  async validateFileContents(file) {
    const detected = await fileTypeFromFile(file.path);

    if (
      !detected ||
      !ALLOWED_UPLOAD_MIME_TYPES.includes(detected.mime) ||
      detected.mime !== file.mimetype
    ) {
      throw new AppError(ERROR_DICTIONARY.INVALID_FILE_TYPE);
    }

    return detected;
  }

  createMetadata(file, documentType) {
    return {
      originalName: file.originalname,
      filename: file.filename,
      path: path.relative(process.cwd(), file.path),
      mimeType: file.mimetype,
      size: file.size,
      documentType,
      uploadedAt: new Date(),
    };
  }

  async cleanupFile(file) {
    if (!file?.path) return;

    try {
      await fs.unlink(file.path);
    } catch (error) {
      if (error.code !== "ENOENT") {
        logger.error("Failed to clean up uploaded file", {
          path: file.path,
          error: error.message,
        });
      }
    }
  }

  async processUpload({
    id,
    file,
    documentType,
    findEntity,
    saveMetadata,
    entityName,
  }) {
    try {
      this.validateId(id);
      this.validateFile(file);

      if (entityName === "User") {
        this.validateDocumentType(documentType);
      }

      const entity = await findEntity(id);

      if (!entity) {
        const notFoundErrors = {
          User: ERROR_DICTIONARY.USER_NOT_FOUND,
          Order: ERROR_DICTIONARY.ORDER_NOT_FOUND,
          Driver: ERROR_DICTIONARY.DRIVER_NOT_FOUND,
        };

        throw new AppError(notFoundErrors[entityName]);
      }

      await this.validateFileContents(file);

      const metadata = this.createMetadata(file, documentType);
      const updatedEntity = await saveMetadata(id, metadata);

      if (!updatedEntity) {
        throw new AppError(ERROR_DICTIONARY.FILE_SAVE_FAILED);
      }

      logger.info("File uploaded successfully", {
        entity: entityName,
        entityId: id,
        filename: file.filename,
        documentType,
      });

      if (entityName === "Order") {
        logger.info("Delivery proof associated with order", {
          orderId: id,
          filename: file.filename,
        });
      }

      // Remove the previous driver's license after replacement.
      if (entityName === "Driver" && entity.license?.path) {
        const previousPath = path.resolve(entity.license.path);

        if (previousPath !== path.resolve(file.path)) {
          await this.cleanupFile({ path: previousPath });
        }
      }

      return updatedEntity;
    } catch (error) {
      await this.cleanupFile(file);

      logger.warning("File upload failed", {
        entity: entityName,
        entityId: id,
        error: error.message,
      });

      if (error instanceof AppError) {
        throw error;
      }

      logger.error("File upload processing failed", {
        entity: entityName,
        entityId: id,
        error: error.message,
      });

      throw new AppError(ERROR_DICTIONARY.FILE_SAVE_FAILED);
    }
  }

  async uploadUserDocument(id, file, documentType) {
    return this.processUpload({
      id,
      file,
      documentType,
      entityName: "User",
      findEntity: (id) => repository.findUser(id),
      saveMetadata: (id, metadata) =>
        repository.addUserDocument(id, metadata),
    });
  }

  async uploadOrderProof(id, file) {
    return this.processUpload({
      id,
      file,
      documentType: DOCUMENT_TYPES.DELIVERY_PROOF,
      entityName: "Order",
      findEntity: (id) => repository.findOrder(id),
      saveMetadata: (id, metadata) =>
        repository.addOrderProof(id, metadata),
    });
  }

  async uploadDriverLicense(id, file) {
    return this.processUpload({
      id,
      file,
      documentType: DOCUMENT_TYPES.DRIVER_LICENSE,
      entityName: "Driver",
      findEntity: (id) => repository.findDriver(id),
      saveMetadata: (id, metadata) =>
        repository.updateDriverLicense(id, metadata),
    });
  }
}
