import crypto from "node:crypto";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { issueTokens, verifyRefreshToken, hashToken, randomToken } from "../utils/jwt.js";
import * as userRepo from "../repositories/user.repository.js";
import { sendWelcomeEmail, sendResetPasswordEmail } from "./email.service.js";

export const register = async ({ name, email, password, phone }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw ApiError.conflict("Email này đã được đăng ký");

  const user = await userRepo.createUser({ name, email, password, phone });
  const tokens = issueTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  sendWelcomeEmail(user); // fire-and-forget
  return { user: user.toSafeJSON(), ...tokens };
};

export const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email, true);
  if (!user || !user.password) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");
  if (user.isBlocked) throw ApiError.forbidden("Tài khoản của bạn đã bị khoá");

  const match = await user.comparePassword(password);
  if (!match) throw ApiError.unauthorized("Email hoặc mật khẩu không đúng");

  const tokens = issueTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  return { user: user.toSafeJSON(), ...tokens };
};

export const refresh = async (token) => {
  if (!token) throw ApiError.unauthorized("Thiếu refresh token");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Refresh token không hợp lệ hoặc đã hết hạn");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== hashToken(token)) {
    throw ApiError.unauthorized("Refresh token không còn hiệu lực");
  }
  if (user.isBlocked) throw ApiError.forbidden("Tài khoản của bạn đã bị khoá");

  const tokens = issueTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  return { user: user.toSafeJSON(), ...tokens };
};

export const logout = async (userId) => {
  if (userId) await User.findByIdAndUpdate(userId, { refreshToken: null });
  return true;
};

export const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);
  // Khong tiet lo email co ton tai hay khong
  if (!user) return { sent: true };

  const rawToken = randomToken(32);
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  await sendResetPasswordEmail(user, resetUrl);

  return { sent: true, ...(env.isProd ? {} : { devResetUrl: resetUrl }) };
};

export const resetPassword = async ({ token, password }) => {
  const hashed = crypto.createHash("sha256").update(String(token)).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken +resetPasswordExpires");

  if (!user) throw ApiError.badRequest("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  user.refreshToken = null; // dang xuat moi thiet bi
  await user.save();

  return true;
};

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("Tài khoản không tồn tại");

  const match = await user.comparePassword(currentPassword);
  if (!match) throw ApiError.badRequest("Mật khẩu hiện tại không đúng");

  user.password = newPassword;
  await user.save();
  return true;
};

export default { register, login, refresh, logout, forgotPassword, resetPassword, changePassword };
