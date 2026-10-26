
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import app from "../src/app.js";

describe("Orders API", () => {
  const validUser = {
    firstName: "Order",
    lastName: "Tester",
    email: "orders.test@example.com",
  };

  const createTestUser = async () => {
    const res = await request(app)
      .post("/api/users")
      .send(validUser);

    expect(res.status).to.equal(201);
    return res.body.data._id;
  };

  const createTestOrder = async () => {
    const userId = await createTestUser();

    const res = await request(app)
      .post("/api/orders")
      .send({
        user: userId,
        total: 150.5,
        deliveryAddress: "123 Test Street",
      });

    expect(res.status).to.equal(201);
    return res.body.data;
  };

  const expectError = (res, statusCode, errorCode, message) => {
    expect(res.status).to.equal(statusCode);
    expect(res.body).to.be.an("object");
    expect(res.body.status).to.equal("error");
    expect(res.body.errorCode).to.equal(errorCode);
    expect(res.body.statusCode).to.equal(statusCode);
    expect(res.body.message).to.equal(message);
    expect(res.body.message).to.be.a("string");
  };

  describe("GET /api/orders", () => {
    it("should return 200 and a list of orders", async () => {
      const res = await request(app).get("/api/orders");

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("array");
    });
  });

  describe("POST /api/orders", () => {
    it("should create an order with valid data", async () => {
      const userId = await createTestUser();

      const res = await request(app)
        .post("/api/orders")
        .send({
          user: userId,
          total: 150.5,
          deliveryAddress: "123 Test Street",
        });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("object");
      expect(res.body.data._id).to.be.a("string");
      expect(res.body.data.user).to.equal(userId);
      expect(res.body.data.total).to.equal(150.5);
      expect(res.body.data.total).to.be.a("number");
      expect(res.body.data.deliveryAddress).to.equal(
        "123 Test Street"
      );
      expect(res.body.data.status).to.equal("pending");
      expect(res.body.data.priority).to.equal("normal");
      expect(res.body.data.createdAt).to.be.a("string");
      expect(res.body.data.updatedAt).to.be.a("string");
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/orders")
        .send({ total: 100 });

      expectError(
        res,
        400,
        "INVALID_ORDER_DATA",
        "Valid user, total, and delivery address are required"
      );
    });

    it("should return 400 for a negative total", async () => {
      const userId = await createTestUser();

      const res = await request(app)
        .post("/api/orders")
        .send({
          user: userId,
          total: -10,
          deliveryAddress: "123 Test Street",
        });

      expectError(
        res,
        400,
        "INVALID_ORDER_DATA",
        "Valid user, total, and delivery address are required"
      );
    });

    it("should return 404 for a nonexistent user", async () => {
      const userId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post("/api/orders")
        .send({
          user: userId.toString(),
          total: 100,
          deliveryAddress: "123 Test Street",
        });

      expectError(res, 404, "USER_NOT_FOUND", "User not found");
    });

    it("should return 400 for an invalid initial status", async () => {
      const userId = await createTestUser();

      const res = await request(app)
        .post("/api/orders")
        .send({
          user: userId,
          total: 100,
          deliveryAddress: "123 Test Street",
          status: "delivered",
        });

      expectError(
        res,
        400,
        "INVALID_ORDER_STATUS",
        "Invalid order status"
      );
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should return an existing order", async () => {
      const order = await createTestOrder();

      const res = await request(app).get(
        `/api/orders/${order._id}`
      );

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("object");
      expect(res.body.data._id).to.equal(order._id);
      expect(res.body.data.total).to.be.a("number");
    });

    it("should return 404 for a nonexistent order", async () => {
      const id = new mongoose.Types.ObjectId();

      const res = await request(app).get(
        `/api/orders/${id}`
      );

      expectError(res, 404, "ORDER_NOT_FOUND", "Order not found");
    });

    it("should return 400 for an invalid order ID", async () => {
      const res = await request(app).get(
        "/api/orders/invalid-id"
      );

      expectError(res, 400, "INVALID_ID", "Invalid resource ID");
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("should update an order from pending to confirmed", async () => {
      const order = await createTestOrder();

      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .send({ status: "confirmed" });

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data.status).to.equal("confirmed");
    });

    it("should reject an invalid status", async () => {
      const order = await createTestOrder();

      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .send({ status: "unknown" });

      expectError(
        res,
        400,
        "INVALID_ORDER_STATUS",
        "Invalid order status"
      );
    });

    it("should reject an invalid status transition", async () => {
      const order = await createTestOrder();

      const res = await request(app)
        .patch(`/api/orders/${order._id}/status`)
        .send({ status: "delivered" });

      expectError(
        res,
        409,
        "INVALID_ORDER_TRANSITION",
        "Invalid order status transition"
      );
    });
  });
});
