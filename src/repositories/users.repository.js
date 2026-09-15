import { UserModel } from "../models/user.model.js";

export class UsersRepository {
  async getAll() {
    return await UserModel.find(
      {},
      {
        __v: 0
      }
    ).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await UserModel.findById(
      id,
      {
        __v: 0
      }
    );
  }

  async findByEmail(email) {
    return await UserModel.findOne(
      { email },
      {
        __v: 0
      }
    );
  }

  async create(userData) {
    return await UserModel.create(userData);
  }

  async updateById(id, updateData) {
    return await UserModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );
  }
}