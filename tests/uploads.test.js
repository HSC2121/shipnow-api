
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";

import app from "../src/app.js";
import { UserModel } from "../src/models/user.model.js";
import { OrderModel } from "../src/models/order.model.js";
import { DriverModel } from "../src/models/driver.model.js";

const pdfBuffer = Buffer.from(
  "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n"
);

const pngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lZkAAAAASUVORK5CYII=",
  "base64"
);

const existingFiles = new Set();

async function trackUploadedFile(filePath) {
  if (filePath) existingFiles.add(filePath);
}

async function getUploadFiles(folder) {
  const directory = path.resolve("uploads", folder);

  try {
    return (await fs.readdir(directory)).sort();
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function createUser() {
  return UserModel.create({
    firstName: "Upload",
    lastName: "Tester",
    email: `upload-${new mongoose.Types.ObjectId()}@example.com`,
  });
}

async function createOrder() {
  const user = await createUser();

  return OrderModel.create({
    user: user._id,
    total: 150,
    deliveryAddress: "123 Test Street",
  });
}

async function createDriver() {
  return DriverModel.create({
    firstName: "Delivery",
    lastName: "Rider",
    email: `driver-${new mongoose.Types.ObjectId()}@example.com`,
    vehicle: "Motorcycle",
  });
}

describe("Uploads API", () => {
  afterEach(async () => {
    for (const filePath of existingFiles) {
      await fs.rm(path.resolve(filePath), { force: true });
    }

    existingFiles.clear();
  });

  describe("POST /api/users/:id/documents", () => {
    it("should upload a valid PDF and save metadata", async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "identity")
        .attach("document", pdfBuffer, {
          filename: "identity.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal("success");

      const updated = await UserModel.findById(user._id);
      expect(updated.documents).to.have.lengthOf(1);

      const document = updated.documents[0];
      await trackUploadedFile(document.path);

      expect(document.originalName).to.equal("identity.pdf");
      expect(document.filename).to.be.a("string");
      expect(document.mimeType).to.equal("application/pdf");
      expect(document.documentType).to.equal("identity");
      expect(document.size).to.equal(pdfBuffer.length);
      expect(document.uploadedAt).to.exist;

      const stats = await fs.stat(path.resolve(document.path));
      expect(stats.isFile()).to.equal(true);
    });

    it("should reject a missing file", async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "identity");

      expect(res.status).to.equal(400);
      expect(res.body.status).to.equal("error");
      expect(res.body.errorCode).to.equal("FILE_REQUIRED");
    });

    it("should reject an invalid document type", async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "unknown")
        .attach("document", pdfBuffer, {
          filename: "identity.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(400);
      expect(res.body.errorCode).to.equal("INVALID_DOCUMENT_TYPE");

      const updated = await UserModel.findById(user._id);
      expect(updated.documents).to.have.lengthOf(0);
    });

    it("should reject unsupported MIME types", async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "identity")
        .attach("document", Buffer.from("plain text"), {
          filename: "notes.txt",
          contentType: "text/plain",
        });

      expect(res.status).to.equal(400);
      expect(res.body.errorCode).to.equal("INVALID_FILE_TYPE");
    });

    it("should reject a disguised file", async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "identity")
        .attach("document", Buffer.from("not a real PDF"), {
          filename: "fake.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(400);
      expect(res.body.errorCode).to.equal("INVALID_FILE_TYPE");
    });

    // Step 7: Verify rejected files are removed from disk.
    it("should remove a rejected file from disk", async () => {
      const user = await createUser();

      const before = await getUploadFiles("documents");

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "identity")
        .attach("document", Buffer.from("fake PDF contents"), {
          filename: "invalid.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(400);
      expect(res.body.errorCode).to.equal("INVALID_FILE_TYPE");

      const after = await getUploadFiles("documents");
      expect(after).to.deep.equal(before);

      const updated = await UserModel.findById(user._id);
      expect(updated.documents).to.have.lengthOf(0);
    });

    it("should reject files larger than 5 MB", async () => {
      const user = await createUser();

      const largeFile = Buffer.alloc(5 * 1024 * 1024 + 1);

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "identity")
        .attach("document", largeFile, {
          filename: "large.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(413);
      expect(res.body.errorCode).to.equal("FILE_TOO_LARGE");
    });

    it("should reject an unexpected file field", async () => {
      const user = await createUser();

      const res = await request(app)
        .post(`/api/users/${user._id}/documents`)
        .field("documentType", "identity")
        .attach("wrongField", pdfBuffer, {
          filename: "identity.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(400);
      expect(res.body.errorCode).to.equal("INVALID_FILE_FIELD");
    });
  });

  describe("POST /api/orders/:id/proof", () => {
    it("should upload delivery proof and associate it with an order", async () => {
      const order = await createOrder();

      const res = await request(app)
        .post(`/api/orders/${order._id}/proof`)
        .attach("proof", pngBuffer, {
          filename: "delivery.png",
          contentType: "image/png",
        });

      expect(res.status).to.equal(201);

      const updated = await OrderModel.findById(order._id);
      expect(updated.deliveryProofs).to.have.lengthOf(1);

      const proof = updated.deliveryProofs[0];
      await trackUploadedFile(proof.path);

      expect(proof.documentType).to.equal("delivery_proof");
      expect(proof.mimeType).to.equal("image/png");
    });

    it("should reject a nonexistent order", async () => {
      const nonexistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/orders/${nonexistentId}/proof`)
        .attach("proof", pdfBuffer, {
          filename: "proof.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(404);
      expect(res.body.errorCode).to.equal("ORDER_NOT_FOUND");
    });
  });

  describe("POST /api/drivers/:id/license", () => {
    it("should upload a driver license", async () => {
      const driver = await createDriver();

      const res = await request(app)
        .post(`/api/drivers/${driver._id}/license`)
        .attach("license", pdfBuffer, {
          filename: "license.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(201);

      const updated = await DriverModel.findById(driver._id);
      expect(updated.license).to.exist;
      expect(updated.license.documentType).to.equal("driver_license");

      await trackUploadedFile(updated.license.path);
    });

    it("should reject a nonexistent driver", async () => {
      const nonexistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post(`/api/drivers/${nonexistentId}/license`)
        .attach("license", pdfBuffer, {
          filename: "license.pdf",
          contentType: "application/pdf",
        });

      expect(res.status).to.equal(404);
      expect(res.body.errorCode).to.equal("DRIVER_NOT_FOUND");
    });

    // Step 7: Verify successful license replacement.
    it("should replace a driver license and delete the previous file", async () => {
      const driver = await createDriver();

      const firstResponse = await request(app)
        .post(`/api/drivers/${driver._id}/license`)
        .attach("license", pdfBuffer, {
          filename: "old-license.pdf",
          contentType: "application/pdf",
        });

      expect(firstResponse.status).to.equal(201);

      const firstDriver = await DriverModel.findById(driver._id);
      const oldPath = path.resolve(firstDriver.license.path);

      await trackUploadedFile(firstDriver.license.path);

      const secondResponse = await request(app)
        .post(`/api/drivers/${driver._id}/license`)
        .attach("license", pdfBuffer, {
          filename: "new-license.pdf",
          contentType: "application/pdf",
        });

      expect(secondResponse.status).to.equal(201);

      const updatedDriver = await DriverModel.findById(driver._id);
      const newPath = path.resolve(updatedDriver.license.path);

      await trackUploadedFile(updatedDriver.license.path);

      expect(updatedDriver.license.originalName).to.equal("new-license.pdf");
      expect(newPath).to.not.equal(oldPath);

      const newFile = await fs.stat(newPath);
      expect(newFile.isFile()).to.equal(true);

      try {
        await fs.stat(oldPath);
        throw new Error("Previous license was not deleted");
      } catch (error) {
        expect(error.code).to.equal("ENOENT");
      }
    });

    // Step 7: Verify rejected replacements preserve the old license.
    it("should preserve the existing license after a rejected replacement", async () => {
      const driver = await createDriver();

      const firstResponse = await request(app)
        .post(`/api/drivers/${driver._id}/license`)
        .attach("license", pdfBuffer, {
          filename: "valid-license.pdf",
          contentType: "application/pdf",
        });

      expect(firstResponse.status).to.equal(201);

      const firstDriver = await DriverModel.findById(driver._id);
      const originalPath = path.resolve(firstDriver.license.path);

      await trackUploadedFile(firstDriver.license.path);

      const before = await getUploadFiles("licenses");

      const rejectedResponse = await request(app)
        .post(`/api/drivers/${driver._id}/license`)
        .attach("license", Buffer.from("invalid PDF"), {
          filename: "fake-license.pdf",
          contentType: "application/pdf",
        });

      expect(rejectedResponse.status).to.equal(400);
      expect(rejectedResponse.body.errorCode).to.equal("INVALID_FILE_TYPE");

      const updatedDriver = await DriverModel.findById(driver._id);

      expect(updatedDriver.license.originalName).to.equal("valid-license.pdf");
      expect(path.resolve(updatedDriver.license.path)).to.equal(originalPath);

      const originalFile = await fs.stat(originalPath);
      expect(originalFile.isFile()).to.equal(true);

      const after = await getUploadFiles("licenses");
      expect(after).to.deep.equal(before);
    });
  });
});
