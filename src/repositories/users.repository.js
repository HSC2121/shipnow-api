
import { UserModel } from "../models/user.model.js";

export class UsersRepository {
  async getAll({ limit, skip }) {
    const [users, total] = await Promise.all([
      UserModel.find({}, { __v: 0 })
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      UserModel.countDocuments(),
    ]);

    return { users, total };
  }

  async findById(id) {
    return await UserModel.findById(
      id,
      { __v: 0 }
    );
  }

  async findByEmail(email) {
    return await UserModel.findOne(
      { email },
      { __v: 0 }
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
        returnDocument: "after",
        runValidators: true,
      }
    );
  }
}
