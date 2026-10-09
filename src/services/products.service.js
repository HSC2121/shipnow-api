
import mongoose from "mongoose";
import { ProductsRepository } from "../repositories/products.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";
import logger from "../config/logger.config.js";

const productsRepository = new ProductsRepository();

export class ProductsService {
  async getProducts() {
    return await productsRepository.getAll();
  }

  async getAvailableProducts() {
    return await productsRepository.getAvailable();
  }

  async getProductById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ID);
    }

    const product = await productsRepository.findById(id);

    if (!product) {
      throw new AppError(ERROR_DICTIONARY.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  async createProduct(productData) {
    if (productData.price < 0) {
      throw new AppError(ERROR_DICTIONARY.INVALID_PRICE);
    }

    if (productData.stock < 0) {
      throw new AppError(ERROR_DICTIONARY.INVALID_STOCK);
    }

    const status =
      productData.stock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK;

    const product = await productsRepository.create({
      ...productData,
      status,
    });

    logger.info("Product created successfully", {
      productId: product._id.toString(),
      status: product.status,
    });

    return product;
  }

  async updateProduct(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ID);
    }

    const existingProduct = await productsRepository.findById(id);

    if (!existingProduct) {
      throw new AppError(ERROR_DICTIONARY.PRODUCT_NOT_FOUND);
    }

    if (updateData.price !== undefined && updateData.price < 0) {
      throw new AppError(ERROR_DICTIONARY.INVALID_PRICE);
    }

    if (updateData.stock !== undefined) {
      if (updateData.stock < 0) {
        throw new AppError(ERROR_DICTIONARY.INVALID_STOCK);
      }

      updateData.status =
        updateData.stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    const updatedProduct = await productsRepository.updateById(
      id,
      updateData
    );

    logger.info("Product updated successfully", {
      productId: id,
      status: updatedProduct.status,
    });

    return updatedProduct;
  }
}
