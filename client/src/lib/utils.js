import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge chi biet cac thang gia tri mac dinh cua Tailwind. Neu khong
 * khai bao, no se coi `text-display-lg` la mot class mau chu va xoa mat khi
 * dung chung voi `text-bone` (hoac nguoc lai). Dang ky day du cac thang tuy
 * chinh trong tailwind.config.js de viec gop class khong lam mat style.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display-sm", "display-md", "display-lg", "eyebrow"] }],
      tracking: [{ tracking: ["editorial", "wideish"] }],
      rounded: [{ rounded: ["bezel", "bezel-inner"] }],
      shadow: [{ shadow: ["ambient", "lift", "inset", "inset-dark"] }],
      "font-family": [{ font: ["display", "sans", "mono"] }],
      ease: [{ ease: ["spring", "spring-out"] }],
      duration: [{ duration: ["400", "600", "800", "1200"] }],
    },
  },
});

export const cn = (...inputs) => twMerge(clsx(inputs));

/* ------------------------------- Dinh dang ------------------------------- */

export const formatVND = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    .format(Number(value) || 0)
    .replace("₫", "đ");

export const formatNumber = (value) => new Intl.NumberFormat("vi-VN").format(Number(value) || 0);

export const formatDate = (value, withTime = false) => {
  if (!value) return "—";
  const d = new Date(value);
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (!withTime) return date;
  return `${date} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
};

export const relativeTime = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(value);
};

/* -------------------------------- San pham ------------------------------- */

/** Gia hien thi thap nhat cua san pham (uu tien gia khuyen mai) */
export const displayPrice = (product) => {
  if (!product?.variants?.length) return 0;
  return Math.min(...product.variants.map((v) => (v.salePrice > 0 ? v.salePrice : v.price)));
};

export const originalPrice = (product) => {
  if (!product?.variants?.length) return 0;
  const variant = product.variants.find((v) => v.salePrice > 0);
  return variant ? variant.price : 0;
};

export const discountPercent = (product) => {
  const original = originalPrice(product);
  if (!original) return 0;
  return Math.round(((original - displayPrice(product)) / original) * 100);
};

export const variantPrice = (variant) =>
  variant?.salePrice > 0 ? variant.salePrice : variant?.price || 0;

export const isInStock = (product) => (product?.variants || []).some((v) => v.stock > 0);

export const totalStock = (product) =>
  (product?.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);

/* --------------------------------- Nhan ---------------------------------- */

export const HOLD_LABELS = {
  low: "Giữ nếp nhẹ",
  medium: "Giữ nếp vừa",
  high: "Giữ nếp cao",
  extreme: "Giữ nếp cực mạnh",
};

export const FINISH_LABELS = {
  matte: "Mờ tự nhiên",
  shiny: "Bóng nhẹ",
  natural: "Tự nhiên",
};

export const ORDER_STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
  returned: "Đã hoàn trả",
};

export const ORDER_STATUS_TONE = {
  pending: "bg-amber-500/12 text-amber-800 ring-amber-600/20",
  confirmed: "bg-sky-500/12 text-sky-800 ring-sky-600/20",
  processing: "bg-indigo-500/12 text-indigo-800 ring-indigo-600/20",
  shipping: "bg-copper/15 text-copper-dark ring-copper/30",
  delivered: "bg-emerald-500/12 text-emerald-800 ring-emerald-600/20",
  cancelled: "bg-red-500/10 text-red-800 ring-red-600/20",
  returned: "bg-ink/8 text-ink-muted ring-ink/15",
};

export const PAYMENT_STATUS_LABELS = {
  pending: "Chưa thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_LABELS = {
  cod: "Thanh toán khi nhận hàng",
  vnpay: "VNPay",
  momo: "Ví MoMo",
  stripe: "Thẻ quốc tế (Stripe)",
};

export const ROLE_LABELS = { customer: "Khách hàng", staff: "Nhân viên", admin: "Quản trị viên" };

/* --------------------------------- Khac ---------------------------------- */

export const buildQuery = (params) => {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) return;
    search.set(key, Array.isArray(value) ? value.join(",") : String(value));
  });
  return search.toString();
};

export const truncate = (str, max = 120) =>
  !str || str.length <= max ? str : `${str.slice(0, max).trimEnd()}…`;

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
