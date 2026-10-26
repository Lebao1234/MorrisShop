import winston from "winston";
import { env } from "../config/env.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level}] ${stack || message}`;
});

const logger = winston.createLogger({
  level: env.isProd ? "info" : "debug",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "HH:mm:ss" }),
    env.isProd ? winston.format.json() : combine(colorize(), devFormat),
  ),
  transports: [new winston.transports.Console({ silent: process.env.NODE_ENV === "test" })],
});

export default logger;
