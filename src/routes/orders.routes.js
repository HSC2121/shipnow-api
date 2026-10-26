
import { Router } from "express";
import { OrdersController } from "../controllers/orders.controller.js";

const router = Router();
const ordersController = new OrdersController();

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

export default router;
