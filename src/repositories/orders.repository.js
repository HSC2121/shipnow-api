
import { OrderModel } from "../models/order.model.js";

export class OrdersRepository {
  async getAll({ limit, skip }) {
    const [orders, total] = await Promise.all([
      OrderModel.find()
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      OrderModel.countDocuments(),
    ]);

    return { orders, total };
  }

  async findById(id) {
    return await OrderModel.findById(id);
  }

  async create(orderData) {
    return await OrderModel.create(orderData);
  }

  async updateById(id, updateData) {
    return await OrderModel.findByIdAndUpdate(
      id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );
  }
}
