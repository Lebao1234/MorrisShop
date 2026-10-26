import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env.js";

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwt.accessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwt.refreshSecret);

/**
 * Refresh token phai duy nhat cho moi lan cap. Neu chi ky { id, role }, hai lan
 * ky trong cung mot giay cho ra chuoi JWT giong het nhau (cung `iat`) - khi do
 * viec xoay vong token khong vo hieu hoa duoc token cu. Them `jti` ngau nhien
 * de moi token la mot ban the rieng biet.
 */
export const issueTokens = (user) => {
  const payload = { id: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ ...payload, jti: randomToken(16) }),
  };
};

export const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: env.jwt.refreshCookieMaxAge,
    path: "/",
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/",
  });
};

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
