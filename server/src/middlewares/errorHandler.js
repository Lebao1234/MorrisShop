import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import { env } from "../config/env.js";

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    error = ApiError.badRequest(details[0]?.message || "Dữ liệu không hợp lệ", details);
  } else if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Giá trị không hợp lệ cho trường '${err.path}'`);
  } else if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "giá trị";
    error = ApiError.conflict(`${field} đã tồn tại`);
  } else if (err.name === "JsonWebTokenError") {
    error = ApiError.unauthorized("Token không hợp lệ");
  } else if (err.name === "TokenExpiredError") {
    error = ApiError.unauthorized("Token đã hết hạn");
  } else if (err.name === "MulterError") {
    error = ApiError.badRequest(
      err.code === "LIMIT_FILE_SIZE" ? "File vượt quá dung lượng cho phép (5MB)" : err.message,
    );
  } else if (!(err instanceof ApiError)) {
    error = new ApiError(err.statusCode || 500, err.message || "Lỗi hệ thống");
    error.stack = err.stack;
  }

  if (error.statusCode >= 500) logger.error(error.stack || error.message);
  else logger.warn(`${req.method} ${req.originalUrl} -> ${error.statusCode}: ${error.message}`);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details ? { errors: error.details } : {}),
    ...(env.isProd ? {} : { stack: error.stack }),
  });
};
