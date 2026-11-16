
import { OrdersService } from "../services/orders.service.js";

const ordersService = new OrdersService();

export class OrdersController {
  async getOrders(req, res, next) {
    try {
      const { orders, pagination } = await ordersService.getOrders(
        req.query
      );

      res.status(200).json({
        status: "success",
        data: orders,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await ordersService.getOrderById(
        req.params.id
      );

      res.status(200).json({
        status: "success",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
      const order = await ordersService.createOrder(req.body);

      res.status(201).json({
        status: "success",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const order = await ordersService.updateOrderStatus(
        req.params.id,
        req.body?.status
      );

      res.status(200).json({
        status: "success",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}
