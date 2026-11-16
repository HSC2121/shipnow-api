
import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";

describe("Products API", () => {
  const createProduct = async (number, stock = 10) => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: `Product ${number}`,
        description: `Test product ${number}`,
        price: 100 + number,
        stock,
      });

    expect(response.status).to.equal(201);
    return response.body.data;
  };

  const createMultipleProducts = async (count) => {
    const products = [];

    for (let i = 1; i <= count; i++) {
      products.push(await createProduct(i));
    }

    return products;
  };

  describe("GET /api/products", () => {
    it("should return an empty paginated list by default", async () => {
      const response = await request(app).get("/api/products");

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

    it("should return the requested page and limit", async () => {
      await createMultipleProducts(5);

      const response = await request(app)
        .get("/api/products?page=2&limit=2");

      expect(response.status).to.equal(200);
      expect(response.body.data).to.have.lengthOf(2);
      expect(response.body.pagination).to.deep.equal({
        page: 2,
        limit: 2,
        total: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
    });

    it("should return an empty page beyond the last page", async () => {
      await createMultipleProducts(2);

      const response = await request(app)
        .get("/api/products?page=5&limit=2");

      expect(response.status).to.equal(200);
      expect(response.body.data).to.deep.equal([]);
      expect(response.body.pagination.total).to.equal(2);
      expect(response.body.pagination.totalPages).to.equal(1);
      expect(response.body.pagination.hasNextPage).to.equal(false);
    });

    it("should not duplicate products across pages", async () => {
      await createMultipleProducts(4);

      const first = await request(app)
        .get("/api/products?page=1&limit=2");

      const second = await request(app)
        .get("/api/products?page=2&limit=2");

      expect(first.status).to.equal(200);
      expect(second.status).to.equal(200);

      const ids = [
        ...first.body.data.map((product) => product._id),
        ...second.body.data.map((product) => product._id),
      ];

      expect(ids).to.have.lengthOf(4);
      expect(new Set(ids).size).to.equal(4);
    });

    it("should reject invalid pagination parameters", async () => {
      const queries = [
        "?page=0",
        "?page=-1",
        "?page=abc",
        "?page=1.5",
        "?limit=0",
        "?limit=-5",
        "?limit=101",
        "?limit=abc",
      ];

      for (const query of queries) {
        const response = await request(app)
          .get(`/api/products${query}`);

        expect(response.status).to.equal(400);
        expect(response.body.status).to.equal("error");
        expect(response.body.errorCode).to.equal(
          "INVALID_PAGINATION"
        );
        expect(response.body.statusCode).to.equal(400);
      }
    });
  });

  describe("GET /api/products/available", () => {
    it("should only return products with available stock", async () => {
      await createProduct(1, 10);
      await createProduct(2, 0);
      await createProduct(3, 5);

      const response = await request(app)
        .get("/api/products/available");

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal("success");
      expect(response.body.data).to.have.lengthOf(2);
      expect(response.body.pagination.total).to.equal(2);

      for (const product of response.body.data) {
        expect(product.status).to.equal("available");
        expect(product.stock).to.be.greaterThan(0);
      }
    });

    it("should paginate available products separately", async () => {
      await createProduct(1, 10);
      await createProduct(2, 0);
      await createProduct(3, 5);
      await createProduct(4, 8);

      const response = await request(app)
        .get("/api/products/available?page=2&limit=2");

      expect(response.status).to.equal(200);
      expect(response.body.data).to.have.lengthOf(1);
      expect(response.body.pagination).to.deep.equal({
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });

    it("should reject invalid pagination parameters", async () => {
      const response = await request(app)
        .get("/api/products/available?limit=101");

      expect(response.status).to.equal(400);
      expect(response.body.status).to.equal("error");
      expect(response.body.errorCode).to.equal(
        "INVALID_PAGINATION"
      );
    });
  });

  describe("POST /api/products", () => {
    it("should create a product with valid data", async () => {
      const product = await createProduct(1, 10);

      expect(product._id).to.be.a("string");
      expect(product.name).to.equal("Product 1");
      expect(product.price).to.equal(101);
      expect(product.stock).to.equal(10);
      expect(product.status).to.equal("available");
    });
  });
});
