
import express from "express";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";

import { swaggerSpecs } from "./docs/swagger.config.js";
import { config } from "./config/env.config.js";

import productsRouter from "./routes/products.routes.js";
import usersRouter from "./routes/users.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import driversRouter from "./routes/drivers.routes.js";
import deliveriesRouter from "./routes/deliveries.routes.js";
import mocksRouter from "./routes/mocks.routes.js";
import loggerRouter from "./routes/logger.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./errors/app.error.js";
import { ERROR_DICTIONARY } from "./errors/error.dictionary.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// Application and database health check
app.get("/health", async (req, res) => {
  const health = {
    status: "OK",
    environment: config.nodeEnv,
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  };

  if (
    mongoose.connection.readyState !== 1 ||
    !mongoose.connection.db
  ) {
    return res.status(503).json({
      ...health,
      status: "ERROR",
    });
  }

  try {
    await mongoose.connection.db.command(
      { ping: 1 },
      { maxTimeMS: 1000 }
    );

    return res.status(200).json(health);
  } catch {
    return res.status(503).json({
      ...health,
      status: "ERROR",
    });
  }
});

// Main API routes
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/drivers", driversRouter);
app.use("/api/deliveries", deliveriesRouter);

// Development and test-only mock routes
if (config.nodeEnv !== "production") {
  app.use("/api/mocks", mocksRouter);
}

// Development-only logger diagnostics
if (config.nodeEnv === "development") {
  app.use("/api/logger", loggerRouter);
}

// Swagger documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs)
);

// Unsupported routes
app.use((req, res, next) => {
  next(new AppError(ERROR_DICTIONARY.ROUTE_NOT_FOUND));
});

// Global error handler
app.use(errorHandler);

export default app;
