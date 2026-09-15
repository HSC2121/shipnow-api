import app from "./app.js";
import { config } from "./config/env.config.js";
import { connectDatabase } from "./config/database.config.js";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(
        `Server running on http://localhost:${config.port}`
      );
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
};

startServer();