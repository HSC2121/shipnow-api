
import { Router } from "express";

import { OrdersController } from "../controllers/orders.controller.js";
import { UploadsController } from "../controllers/uploads.controller.js";

import { uploadProof } from "../config/multer.config.js";
import { handleUpload } from "../middlewares/upload.middleware.js";

const router = Router();

const ordersController = new OrdersController();
const uploadsController = new UploadsController();

router.get("/", (req, res, next) =>
  ordersController.getOrders(req, res, next)
);

router.get("/:id", (req, res, next) =>
  ordersController.getOrderById(req, res, next)
);

router.post("/", (req, res, next) =>
  ordersController.createOrder(req, res, next)
);

router.patch("/:id/status", (req, res, next) =>
  ordersController.updateOrderStatus(req, res, next)
);

// Upload delivery proof
router.post(
  "/:id/proof",
  handleUpload(uploadProof),
  (req, res, next) =>
    uploadsController.uploadOrderProof(req, res, next)
);

export default router;
