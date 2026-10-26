import crypto from "node:crypto";
import qs from "node:querystring";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";
import * as orderService from "./order.service.js";

/* ------------------------------- VNPay ------------------------------- */

const sortObject = (obj) =>
  Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});

const vnpDate = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

const signVnpParams = (params) => {
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, undefined, undefined, {
    encodeURIComponent: (s) => encodeURIComponent(s).replace(/%20/g, "+"),
  });
  return crypto.createHmac("sha512", env.vnpay.hashSecret).update(Buffer.from(signData, "utf-8")).digest("hex");
};

/** Tao URL chuyen huong sang cong VNPay */
export const createVnpayUrl = ({ order, ipAddr = "127.0.0.1", locale = "vn" }) => {
  if (!env.vnpay.enabled) {
    throw ApiError.badRequest("VNPay chưa được cấu hình trên server (thiếu VNPAY_TMN_CODE / VNPAY_HASH_SECRET)");
  }

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: env.vnpay.tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: order.orderCode,
    vnp_OrderInfo: `Thanh toán đơn hàng ${order.orderCode}`,
    vnp_OrderType: "other",
    vnp_Amount: order.total * 100, // VNPay dung don vi x100
    vnp_ReturnUrl: env.vnpay.returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: vnpDate(),
  };

  const secureHash = signVnpParams(params);
  const query = qs.stringify(
    { ...sortObject(params), vnp_SecureHash: secureHash },
    undefined,
    undefined,
    { encodeURIComponent: (s) => encodeURIComponent(s).replace(/%20/g, "+") },
  );

  return `${env.vnpay.url}?${query}`;
};

/** Xac thuc chu ky va cap nhat don hang tu callback/IPN cua VNPay */
export const handleVnpayReturn = async (query) => {
  const received = { ...query };
  const secureHash = received.vnp_SecureHash;
  delete received.vnp_SecureHash;
  delete received.vnp_SecureHashType;

  const expected = signVnpParams(received);
  if (secureHash !== expected) {
    logger.warn(`VNPay: chu ky khong hop le cho don ${received.vnp_TxnRef}`);
    throw ApiError.badRequest("Chữ ký VNPay không hợp lệ");
  }

  const success = received.vnp_ResponseCode === "00" && received.vnp_TransactionStatus === "00";
  const order = await orderService.markPayment(received.vnp_TxnRef, {
    success,
    ref: received.vnp_TransactionNo,
    method: "vnpay",
  });

  return { success, order, responseCode: received.vnp_ResponseCode };
};

/* ------------------------------- Stripe ------------------------------- */

/**
 * Tao Checkout Session cua Stripe.
 * Stripe SDK duoc nap dong de server van chay duoc khi chua cai/cau hinh Stripe.
 */
export const createStripeSession = async ({ order }) => {
  if (!env.stripe.enabled) {
    throw ApiError.badRequest("Stripe chưa được cấu hình trên server (thiếu STRIPE_SECRET_KEY)");
  }

  let Stripe;
  try {
    Stripe = (await import("stripe")).default;
  } catch {
    throw ApiError.internal("Chưa cài package 'stripe' trên server (npm i stripe)");
  }

  const stripe = new Stripe(env.stripe.secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: order.orderCode,
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "vnd",
        unit_amount: item.price,
        product_data: { name: `${item.name} - ${item.variantName || item.variantSku}` },
      },
    })),
    success_url: `${env.clientUrl}/checkout/success?order=${order.orderCode}`,
    cancel_url: `${env.clientUrl}/checkout?cancelled=1`,
  });

  return { url: session.url, sessionId: session.id };
};

export const handleStripeWebhook = async (event) => {
  if (event.type !== "checkout.session.completed") return { ignored: true };
  const session = event.data.object;
  const order = await orderService.markPayment(session.client_reference_id, {
    success: true,
    ref: session.payment_intent,
    method: "stripe",
  });
  return { order };
};

/* --------------------------- Dieu phoi chung --------------------------- */

/** Tra ve thong tin chuyen huong tuong ung voi phuong thuc thanh toan */
export const initiatePayment = async ({ order, method, ipAddr }) => {
  switch (method) {
    case "cod":
      return { type: "cod", redirectUrl: null };
    case "vnpay":
      return { type: "vnpay", redirectUrl: createVnpayUrl({ order, ipAddr }) };
    case "stripe": {
      const session = await createStripeSession({ order });
      return { type: "stripe", redirectUrl: session.url };
    }
    case "momo":
      throw ApiError.badRequest("Thanh toán Momo đang được triển khai");
    default:
      throw ApiError.badRequest("Phương thức thanh toán không hợp lệ");
  }
};

export default {
  createVnpayUrl,
  handleVnpayReturn,
  createStripeSession,
  handleStripeWebhook,
  initiatePayment,
};
