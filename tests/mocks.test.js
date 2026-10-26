
import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";

describe("Mocks API", () => {
  const expectError = (res, statusCode, errorCode, message) => {
    expect(res.status).to.equal(statusCode);
    expect(res.body).to.be.an("object");
    expect(res.body).to.have.all.keys(
      "status",
      "errorCode",
      "statusCode",
      "message"
    );
    expect(res.body.status).to.equal("error");
    expect(res.body.errorCode).to.equal(errorCode);
    expect(res.body.statusCode).to.equal(statusCode);
    expect(res.body.message).to.equal(message);
  };

  describe("GET /api/mocks/users", () => {
    it("should generate 5 mock users", async () => {
      const res = await request(app).get("/api/mocks/users?qty=5");

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("array").with.lengthOf(5);

      for (const user of res.body.data) {
        expect(user.firstName).to.be.a("string");
        expect(user.lastName).to.be.a("string");
        expect(user.email).to.be.a("string");
        expect(user.role).to.equal("user");
      }
    });

    it("should generate 10 users by default", async () => {
      const res = await request(app).get("/api/mocks/users");

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array").with.lengthOf(10);
    });
  });

  describe("GET /api/mocks/drivers", () => {
    it("should generate 3 mock drivers", async () => {
      const res = await request(app).get("/api/mocks/drivers?qty=3");

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("array").with.lengthOf(3);

      for (const driver of res.body.data) {
        expect(driver.firstName).to.be.a("string");
        expect(driver.lastName).to.be.a("string");
        expect(driver.email).to.be.a("string");
        expect(driver.role).to.equal("driver");
        expect(driver.vehicle).to.be.a("string");
        expect(driver.available).to.be.a("boolean");
      }
    });
  });

  describe("GET /api/mocks/orders", () => {
    it("should generate 4 mock orders", async () => {
      const res = await request(app).get("/api/mocks/orders?qty=4");

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("array").with.lengthOf(4);

      for (const order of res.body.data) {
        expect(order.total).to.be.a("number");
        expect(order.total).to.be.within(10, 1000);
        expect(order.deliveryAddress).to.be.a("string");
        expect([
          "pending",
          "confirmed",
          "in_transit",
          "delivered",
          "cancelled"
        ]).to.include(order.status);
        expect(["low", "normal", "high"]).to.include(
          order.priority
        );
      }
    });
  });

  describe("GET /api/mocks/deliveries", () => {
    it("should generate 2 mock deliveries", async () => {
      const res = await request(app).get(
        "/api/mocks/deliveries?qty=2"
      );

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("array").with.lengthOf(2);

      for (const delivery of res.body.data) {
        expect([
          "pending",
          "assigned",
          "in_transit",
          "delivered"
        ]).to.include(delivery.status);

        expect(delivery.estimatedDeliveryDate).to.be.a(
          "string"
        );
        expect(
          Number.isNaN(Date.parse(delivery.estimatedDeliveryDate))
        ).to.equal(false);
      }
    });
  });

  describe("Invalid mock quantities", () => {
    const endpoints = [
      "/api/mocks/users",
      "/api/mocks/drivers",
      "/api/mocks/orders",
      "/api/mocks/deliveries"
    ];

    for (const endpoint of endpoints) {
      it(`should reject qty=0 on ${endpoint}`, async () => {
        const res = await request(app).get(
          `${endpoint}?qty=0`
        );

        expectError(
          res,
          400,
          "INVALID_MOCK_QUANTITY",
          "Quantity must be an integer between 1 and 100"
        );
      });
    }

    it("should reject negative quantities", async () => {
      const res = await request(app).get(
        "/api/mocks/users?qty=-5"
      );

      expectError(
        res,
        400,
        "INVALID_MOCK_QUANTITY",
        "Quantity must be an integer between 1 and 100"
      );
    });

    it("should reject quantities above 100", async () => {
      const res = await request(app).get(
        "/api/mocks/orders?qty=101"
      );

      expectError(
        res,
        400,
        "INVALID_MOCK_QUANTITY",
        "Quantity must be an integer between 1 and 100"
      );
    });

    it("should reject non-integer quantities", async () => {
      const res = await request(app).get(
        "/api/mocks/drivers?qty=2.5"
      );

      expectError(
        res,
        400,
        "INVALID_MOCK_QUANTITY",
        "Quantity must be an integer between 1 and 100"
      );
    });

    it("should reject non-numeric quantities", async () => {
      const res = await request(app).get(
        "/api/mocks/deliveries?qty=abc"
      );

      expectError(
        res,
        400,
        "INVALID_MOCK_QUANTITY",
        "Quantity must be an integer between 1 and 100"
      );
    });
  });

  describe("POST /api/mocks/seed", () => {
    it("should seed 2 records of each entity", async () => {
      const res = await request(app).post(
        "/api/mocks/seed?qty=2"
      );

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal("success");
      expect(res.body.inserted).to.be.an("object");
      expect(res.body.inserted).to.deep.equal({
        users: 2,
        drivers: 2,
        orders: 2,
        deliveries: 2
      });
    });

    it("should reject invalid seed quantities", async () => {
      const res = await request(app).post(
        "/api/mocks/seed?qty=0"
      );

      expectError(
        res,
        400,
        "INVALID_MOCK_QUANTITY",
        "Quantity must be an integer between 1 and 100"
      );
    });
  });
});
