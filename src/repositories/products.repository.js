import { ProductModel } from "../models/product.model.js";
import { PRODUCT_STATUS } from "../constants/index.js";

export class ProductsRepository {
  async getAll() {
    return await ProductModel.find(
      {},
      {
        __v: 0,
      }
    ).sort({ createdAt: -1 });
  }

  async getAvailable() {
    return await ProductModel.find(
      {
        status: PRODUCT_STATUS.AVAILABLE,
        stock: { $gt: 0 },
      },
      {
        __v: 0,
      }
    ).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await ProductModel.findById(id, {
      __v: 0,
    });
  }

  async create(productData) {
    return await ProductModel.create(productData);
  }

  async updateById(id, updateData) {
    return await ProductModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }
}
