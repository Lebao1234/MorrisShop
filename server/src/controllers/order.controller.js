import asyncHandler from "../utils/asyncHandler.js";
import { ok, created, paginated } from "../utils/response.js";
import * as orderService from "../services/order.service.js";
import * as cartService from "../services/cart.service.js";
import * as couponService from "../services/coupon.service.js";
import * as paymentService from "../services/payment.service.js";
import { env } from "../config/env.js";

/* ------------------------------ Gio hang ------------------------------ */

export const getCart = asyncHandler(async (req, res) => ok(res, await cartService.getCart(req.user._id)));

export const addToCart = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, req.body);
  return ok(res, cart, "Đã thêm vào giỏ hàng");
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user._id, req.body.itemId, req.body.quantity);
  return ok(res, cart, "Đã cập nhật giỏ hàng");
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.itemId);
  return ok(res, cart, "Đã xoá khỏi giỏ hàng");
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  return ok(res, cart, "Đã xoá toàn bộ giỏ hàng");
});

export const mergeCart = asyncHandler(async (req, res) => {
  const cart = await cartService.mergeGuestCart(req.user._id, req.body.items);
  return ok(res, cart, "Đã đồng bộ giỏ hàng");
});

/* ------------------------------ Don hang ------------------------------ */

export const previewOrder = asyncHandler(async (req, res) => {
  const preview = await orderService.previewOrder(req.user._id, { couponCode: req.body.couponCode });
  return ok(res, preview);
});

export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);

  const ipAddr =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "127.0.0.1";
  const payment = await paymentService.initiatePayment({
    order,
    method: order.paymentMethod,
    ipAddr,
  });

  return created(res, { order, payment }, "Đặt hàng thành công");
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await orderService.getMyOrders(req.user._id, req.query);
  return paginated(res, items, { page, limit, total });
});

export const getOrderDetail = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetail(req.params.id, req.user);
  return ok(res, order);
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user, req.body?.reason || "");
  return ok(res, order, "Đã huỷ đơn hàng");
});

export const listOrders = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await orderService.listOrders(req.query);
  return paginated(res, items, { page, limit, total });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body, req.user);
  return ok(res, order, "Đã cập nhật trạng thái đơn hàng");
});

/** Tao lai link thanh toan cho don da dat nhung chua thanh toan */
export const retryPayment = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderDetail(req.params.id, req.user);
  const ipAddr =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "127.0.0.1";
  const payment = await paymentService.initiatePayment({
    order,
    method: req.body?.method || order.paymentMethod,
    ipAddr,
  });
  return ok(res, payment);
});

/* ---------------------------- Thanh toan ---------------------------- */

export const vnpayReturn = asyncHandler(async (req, res) => {
  const result = await paymentService.handleVnpayReturn(req.query);
  return ok(res, result, result.success ? "Thanh toán thành công" : "Thanh toán thất bại");
});

/** IPN cua VNPay - phai tra ve dung dinh dang ma VNPay yeu cau */
export const vnpayIpn = asyncHandler(async (req, res) => {
  try {
    await paymentService.handleVnpayReturn(req.query);
    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch {
    return res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
  }
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const result = await paymentService.handleStripeWebhook(req.body);
  return ok(res, result);
});

/* ------------------------------- Coupon ------------------------------- */

export const validateCoupon = asyncHandler(async (req, res) => {
  const subtotal =
    req.body.subtotal != null ? req.body.subtotal : (await cartService.getCart(req.user._id)).subtotal;

  const result = await couponService.validateCoupon({
    code: req.body.code,
    subtotal,
    userId: req.user._id,
  });
  return ok(res, result, "Áp dụng mã giảm giá thành công");
});

export const getPublicCoupons = asyncHandler(async (_req, res) =>
  ok(res, await couponService.listPublicCoupons()),
);

export const listCoupons = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await couponService.listCoupons(req.query);
  return paginated(res, items, { page, limit, total });
});

export const createCoupon = asyncHandler(async (req, res) =>
  created(res, await couponService.createCoupon(req.body), "Đã tạo mã giảm giá"),
);

export const updateCoupon = asyncHandler(async (req, res) =>
  ok(res, await couponService.updateCoupon(req.params.id, req.body), "Đã cập nhật mã giảm giá"),
);

export const deleteCoupon = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  return ok(res, null, "Đã xoá mã giảm giá");
});

/* ------------------------------ Dashboard ----------------------------- */

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getDashboardStats({ days: req.query.days || 30 });
  return ok(res, { ...stats, config: { lowStockThreshold: env.lowStockThreshold } });
});
