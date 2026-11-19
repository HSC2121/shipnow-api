
import { Router } from "express";

import { DeliveriesController } from "../controllers/deliveries.controller.js";

const router = Router();
const deliveriesController = new DeliveriesController();

router.get("/", (req, res, next) =>
  deliveriesController.getDeliveries(req, res, next)
);

router.get("/:id/tracking", (req, res, next) =>
  deliveriesController.getTrackingHistory(req, res, next)
);

router.get("/:id", (req, res, next) =>
  deliveriesController.getDeliveryById(req, res, next)
);

router.post("/", (req, res, next) =>
  deliveriesController.createDelivery(req, res, next)
);

router.patch("/:id/driver", (req, res, next) =>
  deliveriesController.assignDriver(req, res, next)
);

router.patch("/:id/status", (req, res, next) =>
  deliveriesController.updateDeliveryStatus(
    req,
    res,
    next
  )
);

export default router;
