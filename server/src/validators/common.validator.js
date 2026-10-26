import { z } from "zod";

export const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "ID không hợp lệ");

export const idParam = z.object({ id: objectId });

export const slugParam = z.object({ slug: z.string().min(1, "Thiếu slug") });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const vnPhone = z
  .string()
  .trim()
  .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ (VD: 0912345678)");

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Họ tên quá ngắn").max(80),
  phone: vnPhone,
  province: z.string().trim().min(1, "Vui lòng chọn tỉnh/thành"),
  district: z.string().trim().min(1, "Vui lòng chọn quận/huyện"),
  ward: z.string().trim().min(1, "Vui lòng chọn phường/xã"),
  street: z.string().trim().min(3, "Vui lòng nhập địa chỉ cụ thể"),
  isDefault: z.boolean().optional(),
});

export const boolish = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v) => v === true || v === "true");
