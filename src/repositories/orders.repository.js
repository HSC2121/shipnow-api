
import { OrderModel } from "../models/order.model.js";

export class OrdersRepository {
  async getAll() {
    return await OrderModel.find();
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
