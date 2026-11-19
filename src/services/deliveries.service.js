
import mongoose from "mongoose";

import { DeliveriesRepository } from "../repositories/deliveries.repository.js";
import { OrdersRepository } from "../repositories/orders.repository.js";
import { DriversRepository } from "../repositories/drivers.repository.js";

import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";

import { DELIVERY_STATUS } from "../constants/index.js";
import { getPagination } from "../utils/pagination.js";

import logger from "../config/logger.config.js";

const deliveriesRepository = new DeliveriesRepository();
const ordersRepository = new OrdersRepository();
const driversRepository = new DriversRepository();

const ALLOWED_TRANSITIONS = {
  [DELIVERY_STATUS.PENDING]: [DELIVERY_STATUS.ASSIGNED],
  [DELIVERY_STATUS.ASSIGNED]: [DELIVERY_STATUS.IN_TRANSIT],
  [DELIVERY_STATUS.IN_TRANSIT]: [DELIVERY_STATUS.DELIVERED],
  [DELIVERY_STATUS.DELIVERED]: [],
};

const validateId = (id) => {
  if (
    typeof id !== "string" ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new AppError(ERROR_DICTIONARY.INVALID_ID);
  }
};

const validateNote = (note) => {
  if (
    typeof note !== "string" ||
    note.length > 500
  ) {
    throw new AppError(
      ERROR_DICTIONARY.INVALID_TRACKING_NOTE
    );
  }

  return note.trim();
};

export class DeliveriesService {
  async getDeliveries(query = {}) {
    const { page, limit, skip } = getPagination(query);

    const { deliveries, total } =
      await deliveriesRepository.getAll({
        skip,
        limit,
      });

    return {
      deliveries,
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

  async getDeliveryById(id) {
    validateId(id);

    const delivery = await deliveriesRepository.findById(id);

    if (!delivery) {
      throw new AppError(
        ERROR_DICTIONARY.DELIVERY_NOT_FOUND
      );
    }

    return delivery;
  }

  async createDelivery(deliveryData) {
    if (
      !deliveryData ||
      typeof deliveryData.order !== "string" ||
      !mongoose.Types.ObjectId.isValid(deliveryData.order) ||
      typeof deliveryData.estimatedDeliveryDate !== "string"
    ) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_DATA
      );
    }

    const estimatedDeliveryDate = new Date(
      deliveryData.estimatedDeliveryDate
    );

    if (
      !Number.isFinite(estimatedDeliveryDate.getTime())
    ) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_DATA
      );
    }

    if (
      deliveryData.status !== undefined &&
      deliveryData.status !== DELIVERY_STATUS.PENDING
    ) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_STATUS
      );
    }

    const order = await ordersRepository.findById(
      deliveryData.order
    );

    if (!order) {
      throw new AppError(ERROR_DICTIONARY.ORDER_NOT_FOUND);
    }

    const existingDelivery =
      await deliveriesRepository.findByOrderId(
        deliveryData.order
      );

    if (existingDelivery) {
      throw new AppError(
        ERROR_DICTIONARY.DELIVERY_ALREADY_EXISTS
      );
    }

    let driver = null;

    if (
      deliveryData.driver !== undefined &&
      deliveryData.driver !== null
    ) {
      validateId(deliveryData.driver);

      driver = await driversRepository.findById(
        deliveryData.driver
      );

      if (!driver) {
        throw new AppError(
          ERROR_DICTIONARY.DRIVER_NOT_FOUND
        );
      }
    }

    let delivery;

    try {
      delivery = await deliveriesRepository.create({
        order: deliveryData.order,
        driver: driver?._id ?? null,
        estimatedDeliveryDate,
        status: DELIVERY_STATUS.PENDING,
        trackingHistory: [
          {
            status: DELIVERY_STATUS.PENDING,
            timestamp: new Date(),
            note: "Delivery created",
          },
        ],
      });
    } catch (error) {
      // MongoDB unique-index violation.
      // Handles simultaneous creation requests safely.
      if (
        error?.code === 11000 &&
        error?.keyPattern?.order
      ) {
        throw new AppError(
          ERROR_DICTIONARY.DELIVERY_ALREADY_EXISTS
        );
      }

      throw error;
    }

    logger.info("Delivery created successfully", {
      deliveryId: delivery._id.toString(),
      orderId: delivery.order.toString(),
    });

    return delivery;
  }

  async assignDriver(id, driverId) {
    const delivery = await this.getDeliveryById(id);

    validateId(driverId);

    if (
      delivery.status === DELIVERY_STATUS.IN_TRANSIT ||
      delivery.status === DELIVERY_STATUS.DELIVERED
    ) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_TRANSITION
      );
    }

    const driver = await driversRepository.findById(driverId);

    if (!driver) {
      throw new AppError(ERROR_DICTIONARY.DRIVER_NOT_FOUND);
    }

    const updatedDelivery =
      await deliveriesRepository.assignDriverIfAllowed(
        id,
        driver._id,
        [
          DELIVERY_STATUS.PENDING,
          DELIVERY_STATUS.ASSIGNED,
        ]
      );

    if (!updatedDelivery) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_TRANSITION
      );
    }

    logger.info("Driver assigned to delivery", {
      deliveryId: id,
      driverId,
    });

    return updatedDelivery;
  }

  async updateDeliveryStatus(id, status, note = "") {
    const delivery = await this.getDeliveryById(id);

    if (
      !Object.values(DELIVERY_STATUS).includes(status)
    ) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_STATUS
      );
    }

    const validNote = validateNote(note);

    const allowedStatuses =
      ALLOWED_TRANSITIONS[delivery.status] ?? [];

    if (!allowedStatuses.includes(status)) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_TRANSITION
      );
    }

    if (
      status === DELIVERY_STATUS.ASSIGNED &&
      !delivery.driver
    ) {
      throw new AppError(
        ERROR_DICTIONARY.DRIVER_REQUIRED
      );
    }

    const updatedDelivery =
      await deliveriesRepository.addTrackingEvent(
        id,
        delivery.status,
        status,
        validNote
      );

    if (!updatedDelivery) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_DELIVERY_TRANSITION
      );
    }

    logger.info("Delivery status updated", {
      deliveryId: id,
      previousStatus: delivery.status,
      newStatus: status,
    });

    return updatedDelivery;
  }

  async getTrackingHistory(id) {
    const delivery = await this.getDeliveryById(id);

    return {
      deliveryId: delivery._id,
      orderId: delivery.order,
      currentStatus: delivery.status,
      events: delivery.trackingHistory ?? [],
    };
  }
}
