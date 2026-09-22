import { Router } from "express";
import { MocksController } from "../controllers/mocks.controller.js";

const router = Router();
const mocksController = new MocksController();

router.get("/users", (req, res, next) =>
  mocksController.getMockUsers(req, res, next)
);

router.get("/drivers", (req, res, next) =>
  mocksController.getMockDrivers(req, res, next)
);

router.get("/orders", (req, res, next) =>
  mocksController.getMockOrders(req, res, next)
);

router.get("/deliveries", (req, res, next) =>
  mocksController.getMockDeliveries(req, res, next)
);

router.post("/seed", (req, res, next) =>
  mocksController.seedData(req, res, next)
);

export default router;