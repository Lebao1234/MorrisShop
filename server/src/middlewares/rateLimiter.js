import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const skipInDev = () => !env.isProd && process.env.RATE_LIMIT_DEV !== "on";

/** Gioi han chat cho login/register/forgot-password */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { success: false, message: "Quá nhiều lần thử, vui lòng đợi 15 phút" },
});

/** Gioi han chung cho toan bo API */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { success: false, message: "Quá nhiều yêu cầu, vui lòng thử lại sau" },
});

export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInDev,
  message: { success: false, message: "Bạn thao tác quá nhanh, vui lòng chờ một chút" },
});
