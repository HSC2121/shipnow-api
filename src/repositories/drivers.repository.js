
import { DriverModel } from "../models/driver.model.js";

export class DriversRepository {
  async findById(id) {
    return DriverModel.findById(id);
  }
}
