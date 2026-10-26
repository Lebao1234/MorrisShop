import { z } from "zod";
import { objectId, addressSchema } from "./common.validator.js";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "../models/Order.js";

export const createOrderSchema = {
  body: z.object({
    shippingAddress: addressSchema.omit({ isDefault: true }),
    paymentMethod: z.enum(PAYMENT_METHODS).default("cod"),
    couponCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
    note: z.string().max(500).optional(),
  }),
};

export const previewOrderSchema = {
  body: z.object({ couponCode: z.string().trim().toUpperCase().optional().or(z.literal("")) }),
};

export const updateStatusSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(ORDER_STATUSES),
    note: z.string().max(500).optional(),
  }),
};

export const cancelOrderSchema = {
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ reason: z.string().max(500).optional() }).optional().default({}),
};

export const listOrderQuery = {
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      status: z.enum(ORDER_STATUSES).optional(),
      paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
      paymentMethod: z.enum(PAYMENT_METHODS).optional(),
      user: objectId.optional(),
      search: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .passthrough(),
};

/* ------------------------------ Gio hang ------------------------------ */

export const addToCartSchema = {
  body: z.object({
    productId: objectId,
    variantSku: z.string().trim().min(1, "Vui lòng chọn phiên bản"),
    quantity: z.coerce.number().int().min(1).max(99).default(1),
  }),
};

export const updateCartSchema = {
  body: z.object({
    itemId: objectId,
    quantity: z.coerce.number().int().min(0).max(99),
  }),
};

export const mergeCartSchema = {
  body: z.object({
    items: z
      .array(
        z.object({
          productId: objectId,
          variantSku: z.string().min(1),
          quantity: z.coerce.number().int().min(1).max(99),
        }),
      )
      .default([]),
  }),
};

/* ------------------------------- Coupon ------------------------------- */

export const validateCouponSchema = {
  body: z.object({
    code: z.string().trim().min(1, "Vui lòng nhập mã giảm giá"),
    subtotal: z.coerce.number().min(0).optional(),
  }),
};

export const createCouponSchema = {
  body: z
    .object({
      code: z.string().trim().min(3, "Mã tối thiểu 3 ký tự").max(30),
      description: z.string().max(300).optional(),
      type: z.enum(["percent", "fixed"]),
      value: z.coerce.number().min(0),
      minOrderValue: z.coerce.number().min(0).optional(),
      maxDiscount: z.coerce.number().min(0).optional(),
      usageLimit: z.coerce.number().int().min(0).optional(),
      perUserLimit: z.coerce.number().int().min(0).optional(),
      startsAt: z.coerce.date().optional(),
      expiresAt: z.coerce.date(),
      isActive: z.boolean().optional(),
    })
    .refine((v) => v.type !== "percent" || v.value <= 100, {
      message: "Phần trăm giảm tối đa là 100",
      path: ["value"],
    }),
};

export const updateCouponSchema = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      code: z.string().trim().min(3).max(30).optional(),
      description: z.string().max(300).optional(),
      type: z.enum(["percent", "fixed"]).optional(),
      value: z.coerce.number().min(0).optional(),
      minOrderValue: z.coerce.number().min(0).optional(),
      maxDiscount: z.coerce.number().min(0).optional(),
      usageLimit: z.coerce.number().int().min(0).optional(),
      perUserLimit: z.coerce.number().int().min(0).optional(),
      startsAt: z.coerce.date().optional(),
      expiresAt: z.coerce.date().optional(),
      isActive: z.boolean().optional(),
    })
    .partial(),
};
