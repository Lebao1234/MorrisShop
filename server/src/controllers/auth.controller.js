import asyncHandler from "../utils/asyncHandler.js";
import { ok, created } from "../utils/response.js";
import { setRefreshCookie, clearRefreshCookie } from "../utils/jwt.js";
import * as authService from "../services/auth.service.js";
import * as cartService from "../services/cart.service.js";

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setRefreshCookie(res, refreshToken);
  return created(res, { user, accessToken }, "Đăng ký thành công");
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);

  // Gop gio hang khach vang lai (neu client gui kem)
  if (Array.isArray(req.body.guestCart) && req.body.guestCart.length) {
    await cartService.mergeGuestCart(user._id, req.body.guestCart);
  }

  return ok(res, { user, accessToken }, "Đăng nhập thành công");
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, accessToken, refreshToken: newRefresh } = await authService.refresh(token);
  setRefreshCookie(res, newRefresh);
  return ok(res, { user, accessToken }, "Làm mới token thành công");
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user?._id);
  clearRefreshCookie(res);
  return ok(res, null, "Đã đăng xuất");
});

export const me = asyncHandler(async (req, res) => ok(res, req.user.toSafeJSON()));

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return ok(res, result, "Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi");
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return ok(res, null, "Đặt lại mật khẩu thành công, vui lòng đăng nhập lại");
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user._id, req.body);
  return ok(res, null, "Đổi mật khẩu thành công");
});
