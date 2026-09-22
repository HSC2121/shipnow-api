import { MocksService } from "../services/mocks.service.js";

const mocksService = new MocksService();

export class MocksController {
  async getMockUsers(req, res, next) {
    try {
      const qty = req.query.qty ?? 10;
      const users = mocksService.generateUsers(qty);

      res.status(200).json({
        status: "success",
        data: users
      });
    } catch (error) {
      next(error);
    }
  }

  async getMockDrivers(req, res, next) {
    try {
      const qty = req.query.qty ?? 10;
      const drivers = mocksService.generateDrivers(qty);

      res.status(200).json({
        status: "success",
        data: drivers
      });
    } catch (error) {
      next(error);
    }
  }

  async getMockOrders(req, res, next) {
    try {
      const qty = req.query.qty ?? 10;
      const orders = mocksService.generateOrders(qty);

      res.status(200).json({
        status: "success",
        data: orders
      });
    } catch (error) {
      next(error);
    }
  }

  async getMockDeliveries(req, res, next) {
    try {
      const qty = req.query.qty ?? 10;
      const deliveries = mocksService.generateDeliveries(qty);

      res.status(200).json({
        status: "success",
        data: deliveries
      });
    } catch (error) {
      next(error);
    }
  }

  async seedData(req, res, next) {
    try {
      const qty = req.query.qty ?? 10;
      const result = await mocksService.seedData(qty);

      res.status(201).json({
        status: "success",
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}