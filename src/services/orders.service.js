
import mongoose from "mongoose";
import { OrdersRepository } from "../repositories/orders.repository.js";
import { UsersRepository } from "../repositories/users.repository.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";
import { ORDER_STATUS, ORDER_PRIORITY } from "../constants/index.js";
import { getPagination } from "../utils/pagination.js";
import logger from "../config/logger.config.js";

const ordersRepository = new OrdersRepository();
const usersRepository = new UsersRepository();

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.CONFIRMED]: [
    ORDER_STATUS.IN_TRANSIT,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.IN_TRANSIT]: [
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

export class OrdersService {
  async getOrders(query = {}) {
    const { page, limit, skip } = getPagination(query);

    const { orders, total } = await ordersRepository.getAll({
      limit,
      skip,
    });

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async getOrderById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ID);
    }

    const order = await ordersRepository.findById(id);

    if (!order) {
      throw new AppError(ERROR_DICTIONARY.ORDER_NOT_FOUND);
    }

    return order;
  }

  async createOrder(orderData) {
    if (
      !orderData ||
      typeof orderData.user !== "string" ||
      !mongoose.Types.ObjectId.isValid(orderData.user) ||
      typeof orderData.total !== "number" ||
      !Number.isFinite(orderData.total) ||
      orderData.total < 0 ||
      typeof orderData.deliveryAddress !== "string" ||
      !orderData.deliveryAddress.trim()
    ) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ORDER_DATA);
    }

    if (
      orderData.status !== undefined &&
      orderData.status !== ORDER_STATUS.PENDING
    ) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ORDER_STATUS);
    }

    if (
      orderData.priority !== undefined &&
      !Object.values(ORDER_PRIORITY).includes(orderData.priority)
    ) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ORDER_DATA);
    }

    const existingUser = await usersRepository.findById(
      orderData.user
    );

    if (!existingUser) {
      throw new AppError(ERROR_DICTIONARY.USER_NOT_FOUND);
    }

    const order = await ordersRepository.create({
      user: orderData.user,
      total: orderData.total,
      deliveryAddress: orderData.deliveryAddress.trim(),
      status: ORDER_STATUS.PENDING,
      priority: orderData.priority ?? ORDER_PRIORITY.NORMAL,
    });

    logger.info("Order created successfully", {
      orderId: order._id.toString(),
    });

    return order;
  }

  async updateOrderStatus(id, status) {
    const order = await this.getOrderById(id);

    if (!Object.values(ORDER_STATUS).includes(status)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ORDER_STATUS);
    }

    const allowedStatuses = ALLOWED_TRANSITIONS[order.status] ?? [];

    if (!allowedStatuses.includes(status)) {
      throw new AppError(ERROR_DICTIONARY.INVALID_ORDER_TRANSITION);
    }

    const updatedOrder = await ordersRepository.updateById(id, {
      status,
    });

    logger.info("Order status updated successfully", {
      orderId: id,
      previousStatus: order.status,
      newStatus: status,
    });

    return updatedOrder;
  }
}
