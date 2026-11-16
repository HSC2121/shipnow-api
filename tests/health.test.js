
import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";

describe("Health API", () => {
  describe("GET /health", () => {
    it("should return HTTP 200 and a healthy status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("OK");
    });

    it("should return the environment, uptime, and timestamp", async () => {
      const response = await request(app).get("/health");

      expect(response.status).to.equal(200);
      expect(response.body.environment).to.equal("test");

      expect(response.body.uptime).to.be.a("number");
      expect(response.body.uptime).to.be.at.least(0);

      expect(response.body.timestamp).to.be.a("string");
      expect(
        Number.isNaN(Date.parse(response.body.timestamp))
      ).to.equal(false);
    });

    it("should not expose sensitive configuration", async () => {
      const response = await request(app).get("/health");

      expect(response.status).to.equal(200);

      expect(response.body).to.have.all.keys(
        "status",
        "environment",
        "uptime",
        "timestamp"
      );

      expect(response.body).not.to.have.property(
        "mongoUri"
      );
      expect(response.body).not.to.have.property(
        "jwtSecret"
      );
      expect(response.body).not.to.have.property(
        "password"
      );
    });
  });
});
