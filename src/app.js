import express from "express";
import productsRouter from "./routes/products.routes.js";
import usersRouter from "./routes/users.routes.js";

const app = express();

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: error.message || "Internal server error"
  });
});

export default app;