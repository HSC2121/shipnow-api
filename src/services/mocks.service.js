import { faker } from "@faker-js/faker";
import { MocksRepository } from "../repositories/mocks.repository.js";
import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS
} from "../constants/index.js";

const mocksRepository = new MocksRepository();

export class MocksService {
  validateQuantity(qty) {
    const quantity = Number(qty);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      const error = new Error(
        "Quantity must be an integer between 1 and 100"
      );
      error.statusCode = 400;
      throw error;
    }

    return quantity;
  }

  generateUsers(qty = 10) {
    const quantity = this.validateQuantity(qty);

    return Array.from({ length: quantity }, () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      role: USER_ROLES.USER
    }));
  }

  generateDrivers(qty = 10) {
    const quantity = this.validateQuantity(qty);

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

    return Array.from({ length: quantity }, () => ({
      status: faker.helpers.arrayElement(statuses),
      estimatedDeliveryDate: faker.date.future()
    }));
  }

  async seedData(qty = 10) {
    const quantity = this.validateQuantity(qty);

    // Generate and save users
    const users = this.generateUsers(quantity);
    const savedUsers = await mocksRepository.insertUsers(users);

    // Generate and save drivers
    const drivers = this.generateDrivers(quantity);
    const savedDrivers = await mocksRepository.insertDrivers(drivers);

    // Generate orders linked to real users
    const orders = this.generateOrders(quantity).map((order) => ({
      ...order,
      user: faker.helpers.arrayElement(savedUsers)._id
    }));

    const savedOrders = await mocksRepository.insertOrders(orders);

    // Generate one delivery for each saved order
    const deliveries = this.generateDeliveries(quantity).map(
      (delivery, index) => ({
        ...delivery,
        order: savedOrders[index]._id,
        driver: faker.helpers.arrayElement(savedDrivers)._id
      })
    );

    const savedDeliveries =
      await mocksRepository.insertDeliveries(deliveries);

    return {
      inserted: {
        users: savedUsers.length,
        drivers: savedDrivers.length,
        orders: savedOrders.length,
        deliveries: savedDeliveries.length
      }
    };
  }
}