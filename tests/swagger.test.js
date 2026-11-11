import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";
import { swaggerSpecs } from "../src/docs/swagger.config.js";

describe("Swagger API Documentation", () => {
  it("should serve Swagger UI", async () => {
    const res = await request(app).get("/api/docs/");

    expect(res.status).to.equal(200);
    expect(res.headers["content-type"]).to.include("text/html");
    expect(res.text).to.include("Swagger UI");
  });

  it("should use OpenAPI 3.0.0", () => {
    expect(swaggerSpecs).to.be.an("object");
    expect(swaggerSpecs.openapi).to.equal("3.0.0");
    expect(swaggerSpecs.info.title).to.equal("ShipNow API");
  });

  it("should document Users and Orders endpoints", () => {
    expect(swaggerSpecs.paths).to.have.property("/api/users");
    expect(swaggerSpecs.paths).to.have.property("/api/orders");
    expect(swaggerSpecs.paths).to.have.property("/api/orders/{id}");
    expect(swaggerSpecs.paths).to.have.property("/api/orders/{id}/status");

    expect(swaggerSpecs.paths["/api/orders"]).to.have.property("get");
    expect(swaggerSpecs.paths["/api/orders"]).to.have.property("post");
    expect(swaggerSpecs.paths["/api/orders/{id}"]).to.have.property("get");
    expect(swaggerSpecs.paths["/api/orders/{id}/status"]).to.have.property(
      "patch",
    );
  });

  it("should define reusable schemas", () => {
    expect(swaggerSpecs.components.schemas).to.have.property("User");
    expect(swaggerSpecs.components.schemas).to.have.property("Order");
    expect(swaggerSpecs.components.schemas).to.have.property("ErrorResponse");
  });

  it("should document standardized Orders error responses", () => {
    const responses =
      swaggerSpecs.paths["/api/orders/{id}/status"].patch.responses;

    for (const statusCode of ["400", "404", "409"]) {
      expect(responses).to.have.property(statusCode);

      expect(
        responses[statusCode].content["application/json"].schema.$ref,
      ).to.equal("#/components/schemas/ErrorResponse");
    }
  });
});
