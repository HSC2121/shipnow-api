
import { ProductModel } from "../models/product.model.js";
import { PRODUCT_STATUS } from "../constants/index.js";

export class ProductsRepository {
  async getAll({ limit, skip }) {
    const [products, total] = await Promise.all([
      ProductModel.find({}, { __v: 0 })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ProductModel.countDocuments(),
    ]);

    return { products, total };
  }

  async getAvailable({ limit, skip }) {
    const filter = {
      status: PRODUCT_STATUS.AVAILABLE,
      stock: { $gt: 0 },
    };

    const [products, total] = await Promise.all([
      ProductModel.find(filter, { __v: 0 })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
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
      returnDocument: "after",
      runValidators: true,
    });
  }
}
