
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";

import app from "../src/app.js";

describe("Health API", () => {
  describe("GET /health", () => {
    it("should return HTTP 200 when MongoDB is healthy", async () => {
      const response = await request(app).get("/health");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("OK");
    });

    it("should return environment, uptime, and timestamp", async () => {
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

      expect(response.body).not.to.have.property("mongoUri");
      expect(response.body).not.to.have.property("password");
      expect(response.body).not.to.have.property("jwtSecret");
    });

    it("should return 503 if the MongoDB ping fails", async () => {
      const database = mongoose.connection.db;
      const originalCommand = database.command;

      database.command = async () => {
        throw new Error("Simulated database failure");
      };

      try {
        const response = await request(app).get("/health");

        expect(response.status).to.equal(503);
        expect(response.body.status).to.equal("ERROR");
        expect(response.body.environment).to.equal("test");

        expect(JSON.stringify(response.body)).not.to.include(
          "Simulated database failure"
        );
      } finally {
        database.command = originalCommand;
      }
    });

    it("should recover after a simulated database failure", async () => {
      const response = await request(app).get("/health");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("OK");
    });
  });
});
