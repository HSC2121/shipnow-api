
import { Router } from "express";
import logger from "../config/logger.config.js";
import { config } from "../config/env.config.js";

const router = Router();

router.get("/test", (req, res) => {
  if (config.nodeEnv !== "development") {
    return res.status(404).json({
      status: "error",
      errorCode: "ROUTE_NOT_FOUND",
      statusCode: 404,
      message: "Route not found",
    });
  }

  logger.debug("Logger test: debug");
  logger.http("Logger test: http");
  logger.info("Logger test: info");
  logger.warning("Logger test: warning");
  logger.error("Logger test: error");
  logger.fatal("Logger test: fatal");

  return res.status(200).json({
    status: "success",
    message: "Logger test completed",
    levels: [
      "debug",
      "http",
      "info",
      "warning",
      "error",
      "fatal",
    ],
  });
});

export default router;
