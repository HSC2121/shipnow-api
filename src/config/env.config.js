
import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "test" ? ".env.test" : ".env";

// Existing environment variables take priority over local files.
// This allows Docker and hosting platforms to inject their own values.
dotenv.config({ path: envFile });

const REQUIRED_VARIABLES = [
  "PORT",
  "MONGODB_URI",
  "NODE_ENV",
];

const ALLOWED_ENVIRONMENTS = [
  "development",
  "test",
  "production",
];

const ALLOWED_LOG_LEVELS = [
  "fatal",
  "error",
  "warning",
  "info",
  "http",
  "debug",
];

const validateEnvironment = () => {
  for (const variable of REQUIRED_VARIABLES) {
    if (!process.env[variable]?.trim()) {
      throw new Error(
        `Missing required environment variable: ${variable}`
      );
    }
  }

  const port = Number(process.env.PORT);

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      "PORT must be an integer between 1 and 65535"
    );
  }

  const nodeEnv = process.env.NODE_ENV;

  if (!ALLOWED_ENVIRONMENTS.includes(nodeEnv)) {
    throw new Error(
      `NODE_ENV must be one of: ${ALLOWED_ENVIRONMENTS.join(", ")}`
    );
  }

  const mongoUri = process.env.MONGODB_URI;

  if (
    !mongoUri.startsWith("mongodb://") &&
    !mongoUri.startsWith("mongodb+srv://")
  ) {
    throw new Error(
      "MONGODB_URI must be a valid MongoDB connection string"
    );
  }

  const logLevel =
    process.env.LOG_LEVEL ||
    (nodeEnv === "production" ? "info" : "debug");

  if (!ALLOWED_LOG_LEVELS.includes(logLevel)) {
    throw new Error(
      `LOG_LEVEL must be one of: ${ALLOWED_LOG_LEVELS.join(", ")}`
    );
  }

  const externalServiceUrl =
    process.env.EXTERNAL_SERVICE_URL?.trim() || null;

  if (externalServiceUrl) {
    let parsedUrl;

    try {
      parsedUrl = new URL(externalServiceUrl);
    } catch {
      throw new Error(
        "EXTERNAL_SERVICE_URL must be a valid HTTP or HTTPS URL"
      );
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error(
        "EXTERNAL_SERVICE_URL must use HTTP or HTTPS"
      );
    }
  }

  return {
    port,
    mongoUri,
    nodeEnv,
    logLevel,
    externalServiceUrl,
  };
};

export const config = Object.freeze(
  validateEnvironment()
);
