
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import app from "../src/app.js";

describe("Users API", () => {
  const createMultipleUsers = async (count) => {
    const users = [];

    for (let i = 0; i < count; i++) {
      const res = await request(app)
        .post("/api/users")
        .send({
          firstName: `Test${i}`,
          lastName: "User",
          email: `pagination.user.${i}@example.com`,
        });

      expect(res.status).to.equal(201);
      users.push(res.body.data);
    }

    return users;
  };

  describe("GET /api/users", () => {
    it("should return 200 and a list of users", async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("object");
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("array");
    });

    it("should use default pagination values", async () => {
      const res = await request(app).get("/api/users");

      expect(res.status).to.equal(200);
      expect(res.body.pagination).to.deep.equal({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it("should return the requested page and limit", async () => {
      await createMultipleUsers(5);

      const res = await request(app)
        .get("/api/users?page=2&limit=2");

      expect(res.status).to.equal(200);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("array");
      expect(res.body.data).to.have.lengthOf(2);

      expect(res.body.pagination).to.deep.equal({
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it("should return an empty array for a page beyond the total", async () => {
      await createMultipleUsers(2);

      const res = await request(app)
        .get("/api/users?page=5&limit=2");

      expect(res.status).to.equal(200);
      expect(res.body.data).to.be.an("array").that.is.empty;

      expect(res.body.pagination.total).to.equal(2);
      expect(res.body.pagination.totalPages).to.equal(1);
      expect(res.body.pagination.hasNextPage).to.equal(false);
    });

    it("should reject invalid pagination parameters", async () => {
      const invalidQueries = [
        "?page=0",
        "?page=-1",
        "?page=abc",
        "?page=1.5",
        "?limit=0",
        "?limit=-5",
        "?limit=101",
        "?limit=abc",
      ];

      for (const query of invalidQueries) {
        const res = await request(app)
          .get(`/api/users${query}`);

        expect(res.status).to.equal(400);
        expect(res.body.status).to.equal("error");
        expect(res.body.errorCode).to.equal(
          "INVALID_PAGINATION"
        );
        expect(res.body.statusCode).to.equal(400);
        expect(res.body.message).to.equal(
          "Pagination parameters must be positive integers and limit cannot exceed 100"
        );
      }
    });

    it("should not return duplicate users across pages", async () => {
      await createMultipleUsers(4);

      const firstPage = await request(app)
        .get("/api/users?page=1&limit=2");

      const secondPage = await request(app)
        .get("/api/users?page=2&limit=2");

      expect(firstPage.status).to.equal(200);
      expect(secondPage.status).to.equal(200);

      const firstIds = firstPage.body.data.map(
        (user) => user._id
      );

      const secondIds = secondPage.body.data.map(
        (user) => user._id
      );

      expect(firstIds).to.have.lengthOf(2);
      expect(secondIds).to.have.lengthOf(2);

      const uniqueIds = new Set([
        ...firstIds,
        ...secondIds,
      ]);

      expect(uniqueIds.size).to.equal(4);
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return 404 for a nonexistent user", async () => {
      const nonexistentId = new mongoose.Types.ObjectId();

      const res = await request(app).get(
        `/api/users/${nonexistentId}`
      );

      expect(res.status).to.equal(404);
      expect(res.body).to.be.an("object");
      expect(res.body.status).to.equal("error");
      expect(res.body.errorCode).to.equal("USER_NOT_FOUND");
      expect(res.body.statusCode).to.equal(404);
      expect(res.body.message).to.equal("User not found");
      expect(res.body.message).to.be.a("string");
    });

    it("should return 400 for an invalid user ID", async () => {
      const res = await request(app).get(
        "/api/users/invalid-id"
      );

      expect(res.status).to.equal(400);
      expect(res.body).to.be.an("object");
      expect(res.body.status).to.equal("error");
      expect(res.body.errorCode).to.equal("INVALID_ID");
      expect(res.body.statusCode).to.equal(400);
      expect(res.body.message).to.equal("Invalid resource ID");
      expect(res.body.message).to.be.a("string");
    });
  });

  describe("POST /api/users", () => {
    const validUser = {
      firstName: "Test",
      lastName: "User",
      email: "test.user@example.com",
    };

    it("should create a user with valid data", async () => {
      const res = await request(app)
        .post("/api/users")
        .send(validUser);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal("success");
      expect(res.body.data).to.be.an("object");

      expect(res.body.data).to.have.property("_id");
      expect(res.body.data._id).to.be.a("string");

      expect(res.body.data.firstName).to.equal("Test");
      expect(res.body.data.lastName).to.equal("User");
      expect(res.body.data.email).to.equal(
        "test.user@example.com"
      );

      expect(res.body.data.role).to.be.a("string");
      expect(res.body.data.createdAt).to.be.a("string");
      expect(res.body.data.updatedAt).to.be.a("string");
    });

    it("should return 409 for a duplicate email", async () => {
      const firstResponse = await request(app)
        .post("/api/users")
        .send(validUser);

      expect(firstResponse.status).to.equal(201);

      const res = await request(app)
        .post("/api/users")
        .send(validUser);

      expect(res.status).to.equal(409);
      expect(res.body).to.be.an("object");
      expect(res.body.status).to.equal("error");
      expect(res.body.errorCode).to.equal(
        "EMAIL_ALREADY_REGISTERED"
      );
      expect(res.body.statusCode).to.equal(409);
      expect(res.body.message).to.equal(
        "Email already registered"
      );
      expect(res.body.message).to.be.a("string");
    });

    it("should return 400 for incomplete user data", async () => {
      const res = await request(app)
        .post("/api/users")
        .send({
          firstName: "Test",
          lastName: "User",
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.be.an("object");
      expect(res.body.status).to.equal("error");
      expect(res.body.errorCode).to.equal(
        "INVALID_USER_DATA"
      );
      expect(res.body.statusCode).to.equal(400);
      expect(res.body.message).to.equal(
        "First name, last name, and email are required"
      );
      expect(res.body.message).to.be.a("string");
    });
  });

  describe("Unknown routes", () => {
    it("should return 404 for an unsupported route", async () => {
      const res = await request(app).get(
        "/api/users/invalid/route"
      );

      expect(res.status).to.equal(404);
      expect(res.body).to.be.an("object");
      expect(res.body.status).to.equal("error");
      expect(res.body.errorCode).to.equal("ROUTE_NOT_FOUND");
      expect(res.body.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Route not found");
      expect(res.body.message).to.be.a("string");
    });
  });
});
