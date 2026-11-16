
import winston from "winston";
import "winston-daily-rotate-file";
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

const isProduction = config.nodeEnv === "production";

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
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
  new winston.transports.Console({
    format: isProduction ? logFormat : consoleFormat,
  }),
];

if (!isProduction) {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "14d",
      level: "error",
    })
  );
}

const logger = winston.createLogger({
  levels,
  level: config.logLevel,
  format: logFormat,
  transports,
  exitOnError: false,
});

export default logger;
