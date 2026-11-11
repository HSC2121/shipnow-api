
import { expect } from "chai";
import { swaggerSpecs } from "../src/docs/swagger.config.js";

describe("Uploads Swagger Documentation", () => {
  const endpoints = [
    {
      path: "/api/users/{id}/documents",
      fileField: "document",
      extraField: "documentType",
    },
    {
      path: "/api/orders/{id}/proof",
      fileField: "proof",
    },
    {
      path: "/api/drivers/{id}/license",
      fileField: "license",
    },
  ];

  for (const endpoint of endpoints) {
    it(`should document multipart upload for ${endpoint.path}`, () => {
      const operation = swaggerSpecs.paths?.[endpoint.path]?.post;

      expect(operation).to.exist;

      const multipart =
        operation.requestBody?.content?.["multipart/form-data"];

      expect(multipart).to.exist;
      expect(multipart.schema.type).to.equal("object");

      const file = multipart.schema.properties?.[endpoint.fileField];

      expect(file).to.exist;
      expect(file.type).to.equal("string");
      expect(file.format).to.equal("binary");

      expect(multipart.schema.required).to.include(endpoint.fileField);

      if (endpoint.extraField) {
        expect(multipart.schema.required).to.include(endpoint.extraField);
        expect(multipart.schema.properties[endpoint.extraField]).to.exist;
      }

      expect(operation.responses).to.have.property("201");
      expect(operation.responses).to.have.property("400");
      expect(operation.responses).to.have.property("404");
      expect(operation.responses).to.have.property("413");
      expect(operation.responses).to.have.property("500");
    });
  }
});
