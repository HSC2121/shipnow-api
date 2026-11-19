
import request from "supertest";
import { expect } from "chai";

import app from "../src/app.js";
import { DeliveryModel } from "../src/models/delivery.model.js";
import { DriverModel } from "../src/models/driver.model.js";
import { DELIVERY_STATUS } from "../src/constants/index.js";

describe("Delivery Concurrency API", () => {
  const createOrder = async () => {
    const userResponse = await request(app)
      .post("/api/users")
      .send({
        firstName: "Concurrent",
        lastName: "Customer",
        email: "concurrent.customer@example.com",
      });

    expect(userResponse.status).to.equal(201);

    const orderResponse = await request(app)
      .post("/api/orders")
      .send({
        user: userResponse.body.data._id,
        total: 200,
        deliveryAddress: "100 Concurrency Street",
      });

    expect(orderResponse.status).to.equal(201);

    return orderResponse.body.data._id;
  };

  const createDelivery = async (order) => {
    return request(app)
      .post("/api/deliveries")
      .send({
        order,
        estimatedDeliveryDate:
          "2027-01-15T12:00:00.000Z",
      });
  };

  it("should allow only one delivery per order", async () => {
    // Ensure the unique index exists before testing.
    await DeliveryModel.init();

    const order = await createOrder();

    const responses = await Promise.all([
      createDelivery(order),
      createDelivery(order),
    ]);

    const statuses = responses
      .map((response) => response.status)
      .sort((a, b) => a - b);

    expect(statuses).to.deep.equal([201, 409]);

    const conflict = responses.find(
      (response) => response.status === 409
    );

    expect(conflict.body.errorCode).to.equal(
      "DELIVERY_ALREADY_EXISTS"
    );

    const count = await DeliveryModel.countDocuments({
      order,
    });

    expect(count).to.equal(1);
  });

  it("should apply a concurrent status transition only once", async () => {
    const order = await createOrder();
    const creation = await createDelivery(order);

    expect(creation.status).to.equal(201);

    const deliveryId = creation.body.data._id;

    const driver = await DriverModel.create({
      firstName: "Concurrent",
      lastName: "Driver",
      email: "concurrent.driver@example.com",
      vehicle: "Motorcycle",
      available: true,
    });

    const assignment = await request(app)
      .patch(`/api/deliveries/${deliveryId}/driver`)
      .send({
        driver: driver._id.toString(),
      });

    expect(assignment.status).to.equal(200);

    const responses = await Promise.all([
      request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .send({
          status: DELIVERY_STATUS.ASSIGNED,
          note: "First concurrent request",
        }),
      request(app)
        .patch(`/api/deliveries/${deliveryId}/status`)
        .send({
          status: DELIVERY_STATUS.ASSIGNED,
          note: "Second concurrent request",
        }),
    ]);

    const statuses = responses
      .map((response) => response.status)
      .sort((a, b) => a - b);

    expect(statuses).to.deep.equal([200, 409]);

    const conflict = responses.find(
      (response) => response.status === 409
    );

    expect(conflict.body.errorCode).to.equal(
      "INVALID_DELIVERY_TRANSITION"
    );

    const tracking = await request(app)
      .get(`/api/deliveries/${deliveryId}/tracking`);

    expect(tracking.status).to.equal(200);

    expect(tracking.body.data.currentStatus).to.equal(
      DELIVERY_STATUS.ASSIGNED
    );

    const events = tracking.body.data.events;

    expect(events).to.have.lengthOf(2);

    expect(
      events.filter(
        (event) =>
          event.status === DELIVERY_STATUS.ASSIGNED
      )
    ).to.have.lengthOf(1);
  });
});
