
import { Router } from "express";

import { UploadsController } from "../controllers/uploads.controller.js";
import { uploadLicense } from "../config/multer.config.js";
import { handleUpload } from "../middlewares/upload.middleware.js";

const router = Router();
const uploadsController = new UploadsController();

router.post(
  "/:id/license",
  handleUpload(uploadLicense),
  (req, res, next) =>
    uploadsController.uploadDriverLicense(req, res, next)
);

export default router;
