
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./docs/swagger.config.js";
import { config } from "./config/env.config.js";

import productsRouter from "./routes/products.routes.js";
import usersRouter from "./routes/users.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import driversRouter from "./routes/drivers.routes.js";
import mocksRouter from "./routes/mocks.routes.js";
import loggerRouter from "./routes/logger.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./errors/app.error.js";
import { ERROR_DICTIONARY } from "./errors/error.dictionary.js";

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// Public process health check (no sensitive information)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    environment: config.nodeEnv,
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

// Main API routes
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/drivers", driversRouter);

// Mock endpoints are available only in development and testing.
// They are not registered in production.
if (config.nodeEnv !== "production") {
  app.use("/api/mocks", mocksRouter);
}

// Logger test endpoint is development-only.
if (config.nodeEnv === "development") {
  app.use("/api/logger", loggerRouter);
}

// Swagger remains available in all environments for
// educational deployment and Docker verification.
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs)
);

// Unrecognized routes return a standardized 404 response.
app.use((req, res, next) => {
  next(new AppError(ERROR_DICTIONARY.ROUTE_NOT_FOUND));
});

// Centralized error handling
app.use(errorHandler);

export default app;
