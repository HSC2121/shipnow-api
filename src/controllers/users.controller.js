import { UsersService } from "../services/users.service.js";

const usersService = new UsersService();

export class UsersController {
  async getUsers(req, res, next) {
    try {
      const users = await usersService.getUsers();

      res.status(200).json({
        status: "success",
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user =
        await usersService.getUserById(req.params.id);

      res.status(200).json({
        status: "success",
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user =
        await usersService.createUser(req.body);

      res.status(201).json({
        status: "success",
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user =
        await usersService.updateUser(
          req.params.id,
          req.body
        );

      res.status(200).json({
        status: "success",
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}