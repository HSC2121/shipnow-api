import { faker } from "@faker-js/faker";
import { MocksRepository } from "../repositories/mocks.repository.js";
import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS
} from "../constants/index.js";
import { AppError } from "../errors/app.error.js";
import { ERROR_DICTIONARY } from "../errors/error.dictionary.js";
import logger from "../config/logger.config.js";

const mocksRepository = new MocksRepository();

export class MocksService {
  validateQuantity(qty) {
    const quantity = Number(qty);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      throw new AppError(
        ERROR_DICTIONARY.INVALID_MOCK_QUANTITY
      );
    }

    return quantity;
  }

  generateUsers(qty = 10) {
    const quantity = this.validateQuantity(qty);

    logger.debug("Generating mock users", {
      quantity
    });

    return Array.from({ length: quantity }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      role: USER_ROLES.USER
    }));
  }

  generateDrivers(qty = 10) {
    const quantity = this.validateQuantity(qty);

    logger.debug("Generating mock drivers", {
      quantity
    });

    return Array.from({ length: quantity }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      role: USER_ROLES.DRIVER,
      vehicle: faker.vehicle.vehicle(),
      available: faker.datatype.boolean()
    }));
  }

  generateOrders(qty = 10) {
    const quantity = this.validateQuantity(qty);
    const statuses = Object.values(ORDER_STATUS);
    const priorities = Object.values(ORDER_PRIORITY);

    logger.debug("Generating mock orders", {
      quantity
    });

    return Array.from({ length: quantity }, () => ({
      total: faker.number.float({
        min: 10,
        max: 1000,
        fractionDigits: 2
      }),
      status: faker.helpers.arrayElement(statuses),
      priority: faker.helpers.arrayElement(priorities),
      deliveryAddress: faker.location.streetAddress()
    }));
  }

  generateDeliveries(qty = 10) {
    const quantity = this.validateQuantity(qty);
    const statuses = Object.values(DELIVERY_STATUS);

    logger.debug("Generating mock deliveries", {
      quantity
    });

    return Array.from({ length: quantity }, () => ({
      status: faker.helpers.arrayElement(statuses),
      estimatedDeliveryDate: faker.date.future()
    }));
  }

  async seedData(qty = 10) {
    const quantity = this.validateQuantity(qty);

    logger.info("Starting mock database seeding", {
      quantity
    });

    try {
      const users = this.generateUsers(quantity);
      const savedUsers = await mocksRepository.insertUsers(users);

      const drivers = this.generateDrivers(quantity);
      const savedDrivers =
        await mocksRepository.insertDrivers(drivers);

      const orders = this.generateOrders(quantity).map((order) => ({
        ...order,
        user: faker.helpers.arrayElement(savedUsers)._id
      }));

      const savedOrders =
        await mocksRepository.insertOrders(orders);

      const deliveries = this.generateDeliveries(quantity).map(
        (delivery, index) => ({
          ...delivery,
          order: savedOrders[index]._id,
          driver: faker.helpers.arrayElement(savedDrivers)._id
        })
      );

      const savedDeliveries =
        await mocksRepository.insertDeliveries(deliveries);

      const inserted = {
        users: savedUsers.length,
        drivers: savedDrivers.length,
        orders: savedOrders.length,
        deliveries: savedDeliveries.length
      };

      logger.info("Mock database seeding completed successfully", {
        inserted
      });

      return {
        inserted
      };
    } catch (error) {
      logger.error("Mock database seeding failed", {
        error: error.message,
        stack: error.stack
      });

      throw new AppError(
        ERROR_DICTIONARY.MOCK_SEED_FAILED
      );
    }
  }
}