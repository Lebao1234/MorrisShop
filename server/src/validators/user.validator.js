import { z } from "zod";
import { objectId, addressSchema, vnPhone } from "./common.validator.js";
import { BANNER_TYPES } from "../models/Banner.js";

export const updateProfileSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: vnPhone.optional().or(z.literal("")),
    avatar: z.string().optional(),
  }),
};

export const adminUpdateUserSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: vnPhone.optional().or(z.literal("")),
    avatar: z.string().optional(),
    role: z.enum(["customer", "staff", "admin"]).optional(),
    isBlocked: z.boolean().optional(),
    isVerified: z.boolean().optional(),
  }),
};

export const blockUserSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ isBlocked: z.boolean() }),
};

export const addAddressSchema = { body: addressSchema };

export const updateAddressSchema = {
  params: z.object({ addressId: objectId }),
  body: addressSchema.partial(),
};

/* ------------------------------- Review ------------------------------- */

export const createReviewSchema = {
  body: z.object({
    productId: objectId,
    rating: z.coerce.number().int().min(1, "Chọn số sao").max(5),
    comment: z.string().trim().min(10, "Nhận xét tối thiểu 10 ký tự").max(2000),
    images: z.array(z.string()).max(5, "Tối đa 5 ảnh").optional(),
  }),
};

export const updateReviewSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(10).max(2000).optional(),
    images: z.array(z.string()).max(5).optional(),
  }),
};

export const approveReviewSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    isApproved: z.boolean(),
    adminReply: z.string().max(1000).optional(),
  }),
};

/* ------------------------------- Banner ------------------------------- */

export const createBannerSchema = {
  body: z.object({
    type: z.enum(BANNER_TYPES),
    title: z.string().max(200).optional(),
    subtitle: z.string().max(400).optional(),
    eyebrow: z.string().max(80).optional(),
    ctaLabel: z.string().max(60).optional(),
    mediaUrl: z.string().min(1, "Thiếu đường dẫn media"),
    posterUrl: z.string().optional(),
    linkUrl: z.string().optional(),
    position: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateBannerSchema = {
  params: z.object({ id: objectId }),
  body: createBannerSchema.body.partial(),
};
