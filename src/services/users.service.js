import { UsersRepository } from "../repositories/users.repository.js";

const usersRepository = new UsersRepository();

export class UsersService {
  async getUsers() {
    return await usersRepository.getAll();
  }

  async getUserById(id) {
    const user = await usersRepository.findById(id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async createUser(userData) {
    const normalizedEmail = userData.email
      .trim()
      .toLowerCase();

    const existingUser =
      await usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }

    return await usersRepository.create({
      ...userData,
      email: normalizedEmail
    });
  }

  async updateUser(id, updateData) {
    const existingUser =
      await usersRepository.findById(id);

    if (!existingUser) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.email !== undefined) {
      const normalizedEmail = updateData.email
        .trim()
        .toLowerCase();

      const userWithEmail =
        await usersRepository.findByEmail(normalizedEmail);

      if (
        userWithEmail &&
        userWithEmail._id.toString() !== id
      ) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
      }

      updateData.email = normalizedEmail;
    }

    return await usersRepository.updateById(
      id,
      updateData
    );
  }
}