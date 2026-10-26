
import dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "test" ? ".env.test" : ".env";

dotenv.config({ path: envFile });

const requiredEnvVars = [
  "PORT",
  "MONGODB_URI",
  "NODE_ENV",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}`
    );
  }
}

export const config = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
};
