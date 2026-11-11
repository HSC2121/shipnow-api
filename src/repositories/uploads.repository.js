
import { UserModel } from "../models/user.model.js";
import { OrderModel } from "../models/order.model.js";
import { DriverModel } from "../models/driver.model.js";

export class UploadsRepository {
  async findUser(id) {
    return UserModel.findById(id);
  }

  async findOrder(id) {
    return OrderModel.findById(id);
  }

  async findDriver(id) {
    return DriverModel.findById(id);
  }

  async addUserDocument(id, metadata) {
    return UserModel.findByIdAndUpdate(
      id,
      { $push: { documents: metadata } },
      { returnDocument: "after", runValidators: true }
    );
  }

  async addOrderProof(id, metadata) {
    return OrderModel.findByIdAndUpdate(
      id,
      { $push: { deliveryProofs: metadata } },
      { returnDocument: "after", runValidators: true }
    );
  }

  async updateDriverLicense(id, metadata) {
    return DriverModel.findByIdAndUpdate(
      id,
      { $set: { license: metadata } },
      { returnDocument: "after", runValidators: true }
    );
  }
}
