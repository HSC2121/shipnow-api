import { UserModel } from "../models/user.model.js";
import { DriverModel } from "../models/driver.model.js";
import { OrderModel } from "../models/order.model.js";
import { DeliveryModel } from "../models/delivery.model.js";

export class MocksRepository {
  async insertUsers(users) {
    return await UserModel.insertMany(users);
  }

  async insertDrivers(drivers) {
    return await DriverModel.insertMany(drivers);
  }

  async insertOrders(orders) {
    return await OrderModel.insertMany(orders);
  }

  async insertDeliveries(deliveries) {
    return await DeliveryModel.insertMany(deliveries);
  }
}