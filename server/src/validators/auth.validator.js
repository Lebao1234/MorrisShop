import { z } from "zod";
import { vnPhone } from "./common.validator.js";

const password = z
  .string()
  .min(6, "Mật khẩu tối thiểu 6 ký tự")
  .max(72, "Mật khẩu quá dài");

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự").max(80),
    email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
    password,
    phone: vnPhone.optional().or(z.literal("")),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().trim().toLowerCase().email("Email không hợp lệ"),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({ email: z.string().trim().toLowerCase().email("Email không hợp lệ") }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(10, "Token không hợp lệ"),
    password,
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: password,
  }),
};
