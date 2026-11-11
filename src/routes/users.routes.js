
import { Router } from "express";

import { UsersController } from "../controllers/users.controller.js";
import { UploadsController } from "../controllers/uploads.controller.js";

import { uploadDocument } from "../config/multer.config.js";
import { handleUpload } from "../middlewares/upload.middleware.js";

const router = Router();

const usersController = new UsersController();
const uploadsController = new UploadsController();

router.get("/", (req, res, next) =>
  usersController.getUsers(req, res, next)
);

router.get("/:id", (req, res, next) =>
  usersController.getUserById(req, res, next)
);

router.post("/", (req, res, next) =>
  usersController.createUser(req, res, next)
);

router.put("/:id", (req, res, next) =>
  usersController.updateUser(req, res, next)
);

// Upload user identity documents
router.post(
  "/:id/documents",
  handleUpload(uploadDocument),
  (req, res, next) =>
    uploadsController.uploadUserDocument(req, res, next)
);

export default router;
