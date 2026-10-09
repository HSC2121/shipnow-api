
import mongoose from "mongoose";
import { UsersRepository } from "../repositories/users.repository.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";
import logger from "../config/logger.config.js";

const usersRepository = new UsersRepository();

export class UsersService {
  async getUsers() {
    return await usersRepository.getAll();
  }

  async getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ID);
    }

    const user = await usersRepository.findById(id);

    if (!user) {
      throw new AppError(ERROR_DICTIONARY.USER_NOT_FOUND);
    }

    return user;
  }

  async createUser(userData) {
    const normalizedEmail = userData.email.trim().toLowerCase();

    const existingUser =
      await usersRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new AppError(
        ERROR_DICTIONARY.EMAIL_ALREADY_REGISTERED
      );
    }

    const user = await usersRepository.create({
      ...userData,
      email: normalizedEmail
    });

    logger.info("User created successfully", {
      userId: user._id.toString()
    });

    return user;
  }

  async updateUser(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ID);
    }

    const existingUser = await usersRepository.findById(id);

    if (!existingUser) {
      throw new AppError(ERROR_DICTIONARY.USER_NOT_FOUND);
    }

    if (updateData.email !== undefined) {
      const normalizedEmail = updateData.email.trim().toLowerCase();

      const userWithEmail =
        await usersRepository.findByEmail(normalizedEmail);

      if (
        userWithEmail &&
        userWithEmail._id.toString() !== id
      ) {
        throw new AppError(
          ERROR_DICTIONARY.EMAIL_ALREADY_REGISTERED
        );
      }

      updateData.email = normalizedEmail;
    }

    const updatedUser = await usersRepository.updateById(
      id,
      updateData
    );

    logger.info("User updated successfully", {
      userId: id
    });

    return updatedUser;
  }
}
