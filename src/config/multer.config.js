
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_SIZE,
} from "../constants/index.js";

const UPLOAD_ROOT = path.resolve("uploads");

const UPLOAD_FOLDERS = Object.freeze({
  document: "documents",
  proof: "proofs",
  license: "licenses",
});

// Configure disk storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = UPLOAD_FOLDERS[file.fieldname];

    if (!folder) {
      return cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          file.fieldname
        )
      );
    }

    const destination = path.join(UPLOAD_ROOT, folder);

    try {
      fs.mkdirSync(destination, { recursive: true });
      cb(null, destination);
    } catch (error) {
      cb(error);
    }
  },

  filename(req, file, cb) {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename = `${Date.now()}-${randomUUID()}${extension}`;

    cb(null, filename);
  },
});

// Validate declared MIME types
const fileFilter = (req, file, cb) => {
  if (!UPLOAD_FOLDERS[file.fieldname]) {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        file.fieldname
      )
    );
  }

  if (!ALLOWED_UPLOAD_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"));
  }

  cb(null, true);
};

// Centralized Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_SIZE,
    files: 1,
  },
});

// Reusable upload middlewares
export const uploadDocument = upload.single("document");

export const uploadProof = upload.single("proof");

export const uploadLicense = upload.single("license");
