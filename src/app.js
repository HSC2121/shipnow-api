import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpecs } from "./docs/swagger.config.js";

import productsRouter from "./routes/products.routes.js";
import usersRouter from "./routes/users.routes.js";
import mocksRouter from "./routes/mocks.routes.js";
import loggerRouter from "./routes/logger.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./errors/app.error.js";
import { ERROR_DICTIONARY } from "./errors/error.dictionary.js";

const app = express();

app.use(express.json());

// API routes
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/mocks", mocksRouter);
app.use("/api/logger", loggerRouter);

// Swagger API documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Handle nonexistent routes (404)
app.use((req, res, next) => {
  next(new AppError(ERROR_DICTIONARY.ROUTE_NOT_FOUND));
});

// Global error middleware
app.use(errorHandler);

export default app;