
import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";
import { config } from "../src/config/env.config.js";

describe("Logger API", () => {
  describe("GET /api/logger/test", () => {
    it("should run in the isolated test environment", () => {
      expect(config.nodeEnv).to.equal("test");
    });

    it("should return 404 outside development", async () => {
      const res = await request(app).get("/api/logger/test");

      expect(res.status).to.equal(404);
      expect(res.body).to.be.an("object");

      expect(res.body).to.have.all.keys(
        "status",
        "errorCode",
        "statusCode",
        "message"
      );

      expect(res.body.status).to.equal("error");
      expect(res.body.errorCode).to.equal("ROUTE_NOT_FOUND");
      expect(res.body.statusCode).to.equal(404);
      expect(res.body.message).to.equal("Route not found");
    });

    it("should reject unsupported logger routes", async () => {
      const res = await request(app).get(
        "/api/logger/invalid"
      );

      expect(res.status).to.equal(404);
      expect(res.body).to.deep.equal({
        status: "error",
        errorCode: "ROUTE_NOT_FOUND",
        statusCode: 404,
        message: "Route not found"
      });
    });
  });
});
