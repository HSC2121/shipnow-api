
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";

import app from "../src/app.js";
import { DriverModel } from "../src/models/driver.model.js";
import { DELIVERY_STATUS } from "../src/constants/index.js";

describe("Deliveries API", () => {
  const createUser = async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        firstName: "Delivery",
        lastName: "Customer",
        email: "delivery.customer@example.com",
      });

    expect(response.status).to.equal(201);
    return response.body.data._id;
  };

  const createOrder = async () => {
    const user = await createUser();

    const response = await request(app)
      .post("/api/orders")
      .send({
        user,
        total: 150,
        deliveryAddress: "123 Delivery Street",
      });

    expect(response.status).to.equal(201);
    return response.body.data._id;
  };

  const createDriver = async () => {
    return DriverModel.create({
      firstName: "Test",
      lastName: "Driver",
      email: "test.driver@example.com",
      vehicle: "Motorcycle",
      available: true,
    });
  };

  const createDelivery = async (overrides = {}) => {
    const order = await createOrder();

    const response = await request(app)
      .post("/api/deliveries")
      .send({
        order,
        estimatedDeliveryDate: "2027-01-15T12:00:00.000Z",
        ...overrides,
      });

    expect(response.status).to.equal(201);
    return response.body.data;
  };

  const expectError = (response, status, code) => {
    expect(response.status).to.equal(status);
    expect(response.body.status).to.equal("error");
    expect(response.body.errorCode).to.equal(code);
    expect(response.body.statusCode).to.equal(status);
  };

  describe("GET /api/deliveries", () => {
    it("should return an empty paginated list", async () => {
      const response = await request(app)
        .get("/api/deliveries");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.data).to.deep.equal([]);

      expect(response.body.pagination).to.deep.equal({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it("should paginate delivery records", async () => {
      const user = await createUser();

      for (let index = 0; index < 3; index++) {
        const orderResponse = await request(app)
          .post("/api/orders")
          .send({
            user,
            total: 100 + index,
            deliveryAddress: `${index + 1} Test Street`,
          });

        expect(orderResponse.status).to.equal(201);

        const deliveryResponse = await request(app)
          .post("/api/deliveries")
          .send({
            order: orderResponse.body.data._id,
            estimatedDeliveryDate:
              "2027-01-15T12:00:00.000Z",
          });

        expect(deliveryResponse.status).to.equal(201);
      }

      const response = await request(app)
        .get("/api/deliveries?page=2&limit=2");

      expect(response.status).to.equal(200);
      expect(response.body.data).to.have.lengthOf(1);
      expect(response.body.pagination.total).to.equal(3);
      expect(response.body.pagination.page).to.equal(2);
      expect(response.body.pagination.totalPages).to.equal(2);
      expect(response.body.pagination.hasNextPage)
        .to.equal(false);
      expect(response.body.pagination.hasPreviousPage)
        .to.equal(true);
    });

    it("should reject invalid pagination", async () => {
      const response = await request(app)
        .get("/api/deliveries?limit=101");

      expectError(
        response,
        400,
        "INVALID_PAGINATION"
      );
    });
  });

  describe("POST /api/deliveries", () => {
    it("should create a pending delivery with tracking", async () => {
      const delivery = await createDelivery();

      expect(delivery.status).to.equal(
        DELIVERY_STATUS.PENDING
      );
      expect(delivery.driver).to.equal(null);
      expect(delivery.trackingHistory).to.have.lengthOf(1);
      expect(delivery.trackingHistory[0].status)
        .to.equal(DELIVERY_STATUS.PENDING);
    });

    it("should reject invalid delivery data", async () => {
      const response = await request(app)
        .post("/api/deliveries")
        .send({
          order: "invalid-id",
          estimatedDeliveryDate: "not-a-date",
        });

      expectError(
        response,
        400,
        "INVALID_DELIVERY_DATA"
      );
    });

    it("should reject a missing order", async () => {
      const response = await request(app)
        .post("/api/deliveries")
        .send({
          order: new mongoose.Types.ObjectId().toString(),
          estimatedDeliveryDate:
            "2027-01-15T12:00:00.000Z",
        });

      expectError(response, 404, "ORDER_NOT_FOUND");
    });

    it("should reject duplicate deliveries", async () => {
      const delivery = await createDelivery();

      const response = await request(app)
        .post("/api/deliveries")
        .send({
          order: delivery.order,
          estimatedDeliveryDate:
            "2027-01-16T12:00:00.000Z",
        });

      expectError(
        response,
        409,
        "DELIVERY_ALREADY_EXISTS"
      );
    });

    it("should reject invalid initial status", async () => {
      const order = await createOrder();

      const response = await request(app)
        .post("/api/deliveries")
        .send({
          order,
          estimatedDeliveryDate:
            "2027-01-15T12:00:00.000Z",
          status: DELIVERY_STATUS.DELIVERED,
        });

      expectError(
        response,
        400,
        "INVALID_DELIVERY_STATUS"
      );
    });
  });

  describe("GET /api/deliveries/:id", () => {
    it("should return an existing delivery", async () => {
      const delivery = await createDelivery();

      const response = await request(app)
        .get(`/api/deliveries/${delivery._id}`);

      expect(response.status).to.equal(200);
      expect(response.body.data._id).to.equal(delivery._id);
    });

    it("should reject invalid IDs", async () => {
      const response = await request(app)
        .get("/api/deliveries/invalid-id");

      expectError(response, 400, "INVALID_ID");
    });

    it("should return 404 for a missing delivery", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/deliveries/${id}`);

      expectError(response, 404, "DELIVERY_NOT_FOUND");
    });
  });

  describe("PATCH /api/deliveries/:id/driver", () => {
    it("should assign an existing driver", async () => {
      const delivery = await createDelivery();
      const driver = await createDriver();

      const response = await request(app)
        .patch(`/api/deliveries/${delivery._id}/driver`)
        .send({
          driver: driver._id.toString(),
        });

      expect(response.status).to.equal(200);
      expect(response.body.data.driver).to.equal(
        driver._id.toString()
      );
    });

    it("should reject a nonexistent driver", async () => {
      const delivery = await createDelivery();

      const response = await request(app)
        .patch(`/api/deliveries/${delivery._id}/driver`)
        .send({
          driver: new mongoose.Types.ObjectId().toString(),
        });

      expectError(response, 404, "DRIVER_NOT_FOUND");
    });
  });

  describe("Tracking and delivery statuses", () => {
    it("should require a driver before assignment", async () => {
      const delivery = await createDelivery();

      const response = await request(app)
        .patch(`/api/deliveries/${delivery._id}/status`)
        .send({
          status: DELIVERY_STATUS.ASSIGNED,
        });

      expectError(response, 400, "DRIVER_REQUIRED");
    });

    it("should reject invalid status transitions", async () => {
      const delivery = await createDelivery();

      const response = await request(app)
        .patch(`/api/deliveries/${delivery._id}/status`)
        .send({
          status: DELIVERY_STATUS.DELIVERED,
        });

      expectError(
        response,
        409,
        "INVALID_DELIVERY_TRANSITION"
      );
    });

    it("should reject invalid tracking notes", async () => {
      const delivery = await createDelivery();
      const driver = await createDriver();

      await request(app)
        .patch(`/api/deliveries/${delivery._id}/driver`)
        .send({
          driver: driver._id.toString(),
        });

      const response = await request(app)
        .patch(`/api/deliveries/${delivery._id}/status`)
        .send({
          status: DELIVERY_STATUS.ASSIGNED,
          note: "x".repeat(501),
        });

      expectError(
        response,
        400,
        "INVALID_TRACKING_NOTE"
      );
    });

    it("should complete the full delivery lifecycle", async () => {
      const delivery = await createDelivery();
      const driver = await createDriver();

      const assignDriver = await request(app)
        .patch(`/api/deliveries/${delivery._id}/driver`)
        .send({
          driver: driver._id.toString(),
        });

      expect(assignDriver.status).to.equal(200);

      const transitions = [
        {
          status: DELIVERY_STATUS.ASSIGNED,
          note: "Driver assigned",
        },
        {
          status: DELIVERY_STATUS.IN_TRANSIT,
          note: "Package dispatched",
        },
        {
          status: DELIVERY_STATUS.DELIVERED,
          note: "Package delivered",
        },
      ];

      for (const transition of transitions) {
        const response = await request(app)
          .patch(`/api/deliveries/${delivery._id}/status`)
          .send(transition);

        expect(response.status).to.equal(200);
        expect(response.body.data.status).to.equal(
          transition.status
        );
      }

      const tracking = await request(app)
        .get(`/api/deliveries/${delivery._id}/tracking`);

      expect(tracking.status).to.equal(200);
      expect(tracking.body.status).to.equal("success");

      expect(tracking.body.data.currentStatus).to.equal(
        DELIVERY_STATUS.DELIVERED
      );

      expect(tracking.body.data.events).to.have.lengthOf(4);

      expect(
        tracking.body.data.events.map((event) => event.status)
      ).to.deep.equal([
        DELIVERY_STATUS.PENDING,
        DELIVERY_STATUS.ASSIGNED,
        DELIVERY_STATUS.IN_TRANSIT,
        DELIVERY_STATUS.DELIVERED,
      ]);

      expect(
        tracking.body.data.events[2].note
      ).to.equal("Package dispatched");
    });

    it("should reject changes after delivery completion", async () => {
      const delivery = await createDelivery();
      const driver = await createDriver();

      await request(app)
        .patch(`/api/deliveries/${delivery._id}/driver`)
        .send({
          driver: driver._id.toString(),
        });

      for (const status of [
        DELIVERY_STATUS.ASSIGNED,
        DELIVERY_STATUS.IN_TRANSIT,
        DELIVERY_STATUS.DELIVERED,
      ]) {
        const response = await request(app)
          .patch(`/api/deliveries/${delivery._id}/status`)
          .send({ status });

        expect(response.status).to.equal(200);
      }

      const response = await request(app)
        .patch(`/api/deliveries/${delivery._id}/status`)
        .send({
          status: DELIVERY_STATUS.IN_TRANSIT,
        });

      expectError(
        response,
        409,
        "INVALID_DELIVERY_TRANSITION"
      );
    });
  });
});
