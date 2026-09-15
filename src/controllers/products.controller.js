import { ProductsService } from "../services/products.service.js";

const productsService = new ProductsService();

export class ProductsController {
  async getProducts(req, res, next) {
    try {
      const products = await productsService.getProducts();

      res.status(200).json({
        status: "success",
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableProducts(req, res, next) {
    try {
      const products =
        await productsService.getAvailableProducts();

      res.status(200).json({
        status: "success",
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product =
        await productsService.getProductById(req.params.id);

      res.status(200).json({
        status: "success",
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product =
        await productsService.createProduct(req.body);

      res.status(201).json({
        status: "success",
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product =
        await productsService.updateProduct(
          req.params.id,
          req.body
        );

      res.status(200).json({
        status: "success",
        data: product
      });
    } catch (error) {
      next(error);
    }
  }
}