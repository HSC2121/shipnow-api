import { ProductsRepository } from "../repositories/products.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";

const productsRepository = new ProductsRepository();

export class ProductsService {
  async getProducts() {
    return await productsRepository.getAll();
  }

  async getAvailableProducts() {
    return await productsRepository.getAvailable();
  }

  async getProductById(id) {
    const product = await productsRepository.findById(id);

    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    return product;
  }

  async createProduct(productData) {
    if (productData.price < 0) {
      const error = new Error("Price cannot be negative");
      error.statusCode = 400;
      throw error;
    }

    if (productData.stock < 0) {
      const error = new Error("Stock cannot be negative");
      error.statusCode = 400;
      throw error;
    }

    const status =
      productData.stock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK;

    return await productsRepository.create({
      ...productData,
      status,
    });
  }

  async updateProduct(id, updateData) {
    const existingProduct = await productsRepository.findById(id);

    if (!existingProduct) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.price !== undefined && updateData.price < 0) {
      const error = new Error("Price cannot be negative");
      error.statusCode = 400;
      throw error;
    }

    if (updateData.stock !== undefined) {
      if (updateData.stock < 0) {
        const error = new Error("Stock cannot be negative");
        error.statusCode = 400;
        throw error;
      }

      updateData.status =
        updateData.stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    return await productsRepository.updateById(id, updateData);
  }
}
