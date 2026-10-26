
import mongoose from "mongoose";
import { before, after, beforeEach } from "mocha";
import { config } from "../src/config/env.config.js";

before(async function () {
  if (
    config.nodeEnv !== "test" ||
    new URL(config.mongoUri).pathname !== "/shipnow_test"
  ) {
    throw new Error(
      "Tests must use the shipnow_test database!"
    );
  }

  await mongoose.connect(config.mongoUri);
});

beforeEach(async function () {
  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();

  for (const collection of collections) {
    await mongoose.connection.db
      .collection(collection.name)
      .deleteMany({});
  }
});

after(async function () {
  await mongoose.disconnect();
});
