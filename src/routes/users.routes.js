import { Router } from "express";
import { UsersController } from "../controllers/users.controller.js";

const router = Router();
const usersController = new UsersController();

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

export default router;