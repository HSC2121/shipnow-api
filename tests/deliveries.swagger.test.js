
import { expect } from "chai";
import { swaggerSpecs } from "../src/docs/swagger.config.js";

describe("Delivery Swagger Documentation", () => {
  const deliveryPaths = {
    "/api/deliveries": ["get", "post"],
    "/api/deliveries/{id}": ["get"],
    "/api/deliveries/{id}/driver": ["patch"],
    "/api/deliveries/{id}/status": ["patch"],
    "/api/deliveries/{id}/tracking": ["get"],
  };

  it("should document all six Delivery endpoints", () => {
    for (const [path, methods] of Object.entries(deliveryPaths)) {
      expect(
        swaggerSpecs.paths,
        `Missing path: ${path}`
      ).to.have.property(path);

      for (const method of methods) {
        expect(
          swaggerSpecs.paths[path],
          `Missing ${method.toUpperCase()} ${path}`
        ).to.have.property(method);
      }
    }
  });

  it("should define Delivery and Tracking schemas", () => {
    const schemas = swaggerSpecs.components.schemas;

    for (const name of [
      "Delivery",
      "TrackingEvent",
      "Tracking",
      "DeliveryResponse",
      "TrackingResponse",
    ]) {
      expect(schemas).to.have.property(name);
    }
  });

  it("should document creation and status request bodies", () => {
    const creation =
      swaggerSpecs.paths["/api/deliveries"].post;

    const statusUpdate =
      swaggerSpecs.paths[
        "/api/deliveries/{id}/status"
      ].patch;

    expect(
      creation.requestBody.content["application/json"]
        .schema.required
    ).to.include("order");

    expect(
      statusUpdate.requestBody.content["application/json"]
        .schema.required
    ).to.include("status");
  });

  it("should document success and domain errors", () => {
    const createResponses =
      swaggerSpecs.paths["/api/deliveries"]
        .post.responses;

    expect(createResponses).to.have.all.keys(
      "201",
      "400",
      "404",
      "409"
    );

    const updateResponses =
      swaggerSpecs.paths[
        "/api/deliveries/{id}/status"
      ].patch.responses;

    expect(updateResponses).to.have.all.keys(
      "200",
      "400",
      "404",
      "409"
    );
  });

  it("should document pagination limits", () => {
    const parameters =
      swaggerSpecs.paths["/api/deliveries"]
        .get.parameters;

    const limit = parameters.find(
      (parameter) => parameter.name === "limit"
    );

    expect(limit).to.exist;
    expect(limit.schema.minimum).to.equal(1);
    expect(limit.schema.maximum).to.equal(100);
    expect(limit.schema.default).to.equal(10);
  });
});
