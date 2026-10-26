import { verifyAccessToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

const extractToken = (req) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
};

/** Bat buoc dang nhap */
export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Bạn chưa đăng nhập");

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === "TokenExpiredError" ? "Phiên đăng nhập đã hết hạn" : "Token không hợp lệ",
    );
  }

  const user = await User.findById(decoded.id);
  if (!user) throw ApiError.unauthorized("Tài khoản không tồn tại");
  if (user.isBlocked) throw ApiError.forbidden("Tài khoản của bạn đã bị khoá");

  req.user = user;
  next();
});

/** Gan req.user neu co token, khong loi neu thieu */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked) req.user = user;
  } catch {
    /* bo qua token loi */
  }
  next();
});

/** RBAC: authorize("admin", "staff") */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Chỉ ${roles.join(" / ")} mới được thực hiện hành động này`));
    }
    next();
  };

/** Cho phep chinh chu tai nguyen hoac admin */
export const ownerOrAdmin = (paramKey = "id") => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role === "admin" || String(req.user._id) === String(req.params[paramKey])) return next();
  return next(ApiError.forbidden());
};
