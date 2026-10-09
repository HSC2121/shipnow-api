import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDatabase } from "./config/database.config.js";
import logger from "./config/logger.config.js";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      logger.info("ShipNow server started successfully", {
        port: config.port,
        environment: config.nodeEnv,
      });
    });
  } catch (error) {
    logger.fatal("ShipNow server failed to start", {
      error: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
};

startServer();