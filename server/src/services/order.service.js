import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";
import { genOrderCode, parsePagination, pickPrice } from "../utils/helpers.js";
import * as orderRepo from "../repositories/order.repository.js";
import * as cartService from "./cart.service.js";
import * as couponService from "./coupon.service.js";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "./email.service.js";
import logger from "../utils/logger.js";

/** Phí vận chuyển: mien phi khi don dat nguong */
export const calcShippingFee = (subtotal) =>
  subtotal >= env.shipping.freeThreshold ? 0 : env.shipping.fee;

/**
 * Tru ton kho theo dieu kien nguyen tu.
 * Tra ve true neu tru thanh cong, false neu khong du hang.
 */
const decrementStock = async (productId, sku, qty) => {
  const res = await Product.updateOne(
    { _id: productId, variants: { $elemMatch: { sku, stock: { $gte: qty } } } },
    { $inc: { "variants.$.stock": -qty, soldCount: qty } },
  );
  return res.modifiedCount === 1;
};

const restoreStock = (productId, sku, qty) =>
  Product.updateOne(
    { _id: productId, "variants.sku": sku },
    { $inc: { "variants.$.stock": qty, soldCount: -qty } },
  );

/**
 * Tao don hang tu gio hang cua user.
 * Tinh lai toan bo gia o server - khong bao gio tin gia do client gui len.
 */
export const createOrder = async (userId, payload) => {
  const cart = await cartService.getCart(userId);
  if (!cart.items.length) throw ApiError.badRequest("Giỏ hàng đang trống");

  const outOfStock = cart.items.filter((i) => i.outOfStock);
  if (outOfStock.length) {
    throw ApiError.badRequest(
      `Sản phẩm không đủ tồn kho: ${outOfStock.map((i) => `${i.product.name} (${i.variantName})`).join(", ")}`,
    );
  }

  const items = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    slug: i.product.slug,
    image: i.product.image,
    variantSku: i.variantSku,
    variantName: i.variantName,
    price: i.price,
    quantity: i.quantity,
  }));

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingFee = calcShippingFee(subtotal);

  let discount = 0;
  let couponDoc = null;
  if (payload.couponCode) {
    const result = await couponService.validateCoupon({
      code: payload.couponCode,
      subtotal,
      userId,
    });
    discount = result.discount;
    couponDoc = result.coupon;
  }

  const total = Math.max(0, subtotal + shippingFee - discount);

  // Tru ton kho truoc, rollback neu co item that bai
  const applied = [];
  for (const item of items) {
    const ok = await decrementStock(item.product, item.variantSku, item.quantity);
    if (!ok) {
      await Promise.all(applied.map((a) => restoreStock(a.product, a.variantSku, a.quantity)));
      throw ApiError.badRequest(`Sản phẩm "${item.name}" vừa hết hàng, vui lòng cập nhật giỏ hàng`);
    }
    applied.push(item);
  }

  let order;
  try {
    order = await Order.create({
      orderCode: genOrderCode(),
      user: userId,
      items,
      shippingAddress: payload.shippingAddress,
      paymentMethod: payload.paymentMethod || "cod",
      paymentStatus: "pending",
      orderStatus: "pending",
      statusHistory: [{ status: "pending", note: "Khách hàng đặt đơn", updatedAt: new Date() }],
      subtotal,
      shippingFee,
      discount,
      total,
      coupon: couponDoc?._id || null,
      couponCode: couponDoc?.code || null,
      note: payload.note || "",
    });
  } catch (err) {
    await Promise.all(applied.map((a) => restoreStock(a.product, a.variantSku, a.quantity)));
    throw err;
  }

  if (couponDoc) await couponService.consumeCoupon(couponDoc._id, userId);
  await Cart.findOneAndUpdate({ user: userId }, { items: [] });

  const populated = await order.populate("user", "name email");
  sendOrderConfirmation(populated, populated.user);

  return populated;
};

export const getMyOrders = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query, 10);
  const filter = { user: userId };
  if (query.status) filter.orderStatus = query.status;

  const { items, total } = await orderRepo.findOrders(filter, { skip, limit });
  return { items, total, page, limit };
};

export const getOrderDetail = async (idOrCode, requester) => {
  const order = await orderRepo.findByCodeOrId(idOrCode);
  if (!order) throw ApiError.notFound("Không tìm thấy đơn hàng");

  const isOwner = String(order.user?._id || order.user) === String(requester._id);
  const isStaff = ["admin", "staff"].includes(requester.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden("Bạn không thể xem đơn hàng này");

  return order;
};

export const listOrders = async (query) => {
  const { page, limit, skip } = parsePagination(query, 15);
  const filter = orderRepo.buildOrderFilter(query);
  const { items, total } = await orderRepo.findOrders(filter, { skip, limit });
  return { items, total, page, limit };
};

/** Khach tu huy don khi con o trang thai pending */
export const cancelOrder = async (idOrCode, requester, reason = "") => {
  const order = await orderRepo.findByCodeOrId(idOrCode);
  if (!order) throw ApiError.notFound("Không tìm thấy đơn hàng");

  const isOwner = String(order.user?._id || order.user) === String(requester._id);
  const isStaff = ["admin", "staff"].includes(requester.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden("Bạn không thể huỷ đơn hàng này");

  if (isOwner && !isStaff && order.orderStatus !== "pending") {
    throw ApiError.badRequest("Chỉ có thể huỷ đơn khi đơn đang chờ xác nhận");
  }
  if (["delivered", "cancelled", "returned"].includes(order.orderStatus)) {
    throw ApiError.badRequest("Đơn hàng này không thể huỷ");
  }

  await Promise.all(
    order.items.map((i) => restoreStock(i.product?._id || i.product, i.variantSku, i.quantity)),
  );
  if (order.coupon) await couponService.releaseCoupon(order.coupon, order.user?._id || order.user);

  order.orderStatus = "cancelled";
  order.cancelReason = reason;
  order.statusHistory.push({
    status: "cancelled",
    note: reason || "Đơn hàng bị huỷ",
    updatedBy: requester._id,
    updatedAt: new Date(),
  });
  if (order.paymentStatus === "paid") order.paymentStatus = "refunded";
  await order.save();

  if (order.user?.email) sendOrderStatusUpdate(order, order.user, reason);
  return order;
};

/** Admin/staff cap nhat trang thai theo luong hop le */
export const updateOrderStatus = async (idOrCode, { status, note = "" }, actor) => {
  const order = await orderRepo.findByCodeOrId(idOrCode);
  if (!order) throw ApiError.notFound("Không tìm thấy đơn hàng");

  if (status === "cancelled") return cancelOrder(idOrCode, actor, note);

  if (!order.canTransitionTo(status)) {
    throw ApiError.badRequest(
      `Không thể chuyển từ trạng thái "${order.orderStatus}" sang "${status}"`,
    );
  }

  if (status === "returned") {
    await Promise.all(
      order.items.map((i) => restoreStock(i.product?._id || i.product, i.variantSku, i.quantity)),
    );
    order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : order.paymentStatus;
  }

  order.orderStatus = status;
  if (status === "delivered") {
    order.deliveredAt = new Date();
    if (order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
    }
  }
  order.statusHistory.push({ status, note, updatedBy: actor._id, updatedAt: new Date() });
  await order.save();

  if (order.user?.email) sendOrderStatusUpdate(order, order.user, note);
  return order;
};

/** Ghi nhan ket qua thanh toan tu cong thanh toan */
export const markPayment = async (orderCode, { success, ref, method }) => {
  const order = await Order.findOne({ orderCode }).populate("user", "name email");
  if (!order) throw ApiError.notFound("Không tìm thấy đơn hàng");

  if (order.paymentStatus === "paid") return order; // idempotent

  order.paymentStatus = success ? "paid" : "failed";
  order.paymentRef = ref || order.paymentRef;
  if (method) order.paymentMethod = method;

  if (success) {
    order.paidAt = new Date();
    if (order.orderStatus === "pending") {
      order.orderStatus = "confirmed";
      order.statusHistory.push({
        status: "confirmed",
        note: "Thanh toán thành công",
        updatedAt: new Date(),
      });
    }
  }
  await order.save();
  logger.info(`Don ${orderCode}: thanh toan ${success ? "thanh cong" : "that bai"}`);
  return order;
};

/** Xem truoc tong tien truoc khi dat hang (dung cho trang checkout) */
export const previewOrder = async (userId, { couponCode } = {}) => {
  const cart = await cartService.getCart(userId);
  const subtotal = cart.subtotal;
  const shippingFee = calcShippingFee(subtotal);

  let discount = 0;
  let coupon = null;
  let couponError = null;

  if (couponCode) {
    try {
      const result = await couponService.validateCoupon({ code: couponCode, subtotal, userId });
      discount = result.discount;
      coupon = result.coupon;
    } catch (err) {
      couponError = err.message;
    }
  }

  return {
    items: cart.items,
    subtotal,
    shippingFee,
    discount,
    coupon,
    couponError,
    total: Math.max(0, subtotal + shippingFee - discount),
    freeShippingThreshold: env.shipping.freeThreshold,
    amountToFreeShipping: Math.max(0, env.shipping.freeThreshold - subtotal),
  };
};

/** Thong ke dashboard admin */
export const getDashboardStats = async ({ days = 30 } = {}) => {
  const since = new Date();
  since.setDate(since.getDate() - Number(days));
  since.setHours(0, 0, 0, 0);

  const paidMatch = { paymentStatus: "paid", orderStatus: { $ne: "cancelled" } };

  const [revenueByDay, statusBreakdown, totals, topProducts] = await Promise.all([
    Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] },
          },
          avgOrderValue: { $avg: "$total" },
        },
      },
    ]),
    Order.aggregate([
      { $match: { orderStatus: { $nin: ["cancelled", "returned"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          slug: { $first: "$items.slug" },
          image: { $first: "$items.image" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 8 },
    ]),
  ]);

  const User = mongoose.model("User");
  const [newCustomers, totalCustomers, pendingOrders, lowStock] = await Promise.all([
    User.countDocuments({ role: "customer", createdAt: { $gte: since } }),
    User.countDocuments({ role: "customer" }),
    Order.countDocuments({ orderStatus: "pending" }),
    Product.countDocuments({ isActive: true, "variants.stock": { $lte: env.lowStockThreshold } }),
  ]);

  return {
    range: { days: Number(days), since },
    summary: {
      totalOrders: totals[0]?.totalOrders || 0,
      totalRevenue: totals[0]?.totalRevenue || 0,
      avgOrderValue: Math.round(totals[0]?.avgOrderValue || 0),
      newCustomers,
      totalCustomers,
      pendingOrders,
      lowStockProducts: lowStock,
    },
    revenueByDay: revenueByDay.map((r) => ({ date: r._id, revenue: r.revenue, orders: r.orders })),
    statusBreakdown: statusBreakdown.map((s) => ({ status: s._id, count: s.count })),
    topProducts,
  };
};

export { pickPrice };
export default {
  createOrder,
  getMyOrders,
  getOrderDetail,
  listOrders,
  cancelOrder,
  updateOrderStatus,
  markPayment,
  previewOrder,
  getDashboardStats,
  calcShippingFee,
};
