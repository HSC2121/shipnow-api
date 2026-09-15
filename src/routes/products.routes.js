import { Router } from "express";
import { ProductsController } from "../controllers/products.controller.js";

const router = Router();
const productsController = new ProductsController();

router.get("/", (req, res, next) =>
  productsController.getProducts(req, res, next)
);

router.get("/available", (req, res, next) =>
  productsController.getAvailableProducts(req, res, next)
);

router.get("/:id", (req, res, next) =>
  productsController.getProductById(req, res, next)
);

router.post("/", (req, res, next) =>
  productsController.createProduct(req, res, next)
);

router.put("/:id", (req, res, next) =>
  productsController.updateProduct(req, res, next)
);

export default router;