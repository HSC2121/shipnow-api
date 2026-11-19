
import winston from "winston";
import { config } from "./env.config.js";

const levels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
};

winston.addColors({
  fatal: "bold red",
  error: "red",
  warning: "yellow",
  info: "green",
  http: "cyan",
  debug: "gray",
});

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ level: true }),
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.printf(
    ({ timestamp, level, message, ...metadata }) => {
      const details = Object.keys(metadata).length
        ? ` ${JSON.stringify(metadata)}`
        : "";

      return `${timestamp} [${level}] ${message}${details}`;
    }
  )
);

const transports = [
  // Error-level and higher severity messages.
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: fileFormat,
  }),

  // All messages permitted by the configured logger level.
  new winston.transports.File({
    filename: "logs/combined.log",
    format: fileFormat,
  }),
];

// Console logging is enabled only during development.
if (config.nodeEnv === "development") {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

const logger = winston.createLogger({
  levels,
  level: config.logLevel,
  format: fileFormat,
  transports,
  exitOnError: false,
});

export default logger;
