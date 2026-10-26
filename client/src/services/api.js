import axiosClient, { uploadClient } from "./axiosClient.js";
import { buildQuery } from "@/lib/utils";

/* --------------------------------- Auth ---------------------------------- */
export const authApi = {
  register: (payload) => axiosClient.post("/auth/register", payload),
  login: (payload) => axiosClient.post("/auth/login", payload),
  logout: () => axiosClient.post("/auth/logout"),
  refresh: () => axiosClient.post("/auth/refresh-token"),
  me: () => axiosClient.get("/auth/me"),
  forgotPassword: (email) => axiosClient.post("/auth/forgot-password", { email }),
  resetPassword: (payload) => axiosClient.post("/auth/reset-password", payload),
  changePassword: (payload) => axiosClient.post("/auth/change-password", payload),
};

/* -------------------------------- Products -------------------------------- */
export const productApi = {
  list: (params) => axiosClient.get(`/products?${buildQuery(params)}`),
  detail: (slug) => axiosClient.get(`/products/${slug}`),
  related: (id, limit = 4) => axiosClient.get(`/products/${id}/related?limit=${limit}`),
  showcase: () => axiosClient.get("/products/showcase"),
  suggestions: (q) => axiosClient.get(`/products/suggestions?q=${encodeURIComponent(q)}`),
  lowStock: (threshold) => axiosClient.get(`/products/low-stock?threshold=${threshold ?? ""}`),
  create: (payload) => axiosClient.post("/products", payload),
  update: (id, payload) => axiosClient.put(`/products/${id}`, payload),
  remove: (id) => axiosClient.delete(`/products/${id}`),
  updateStock: (id, updates) => axiosClient.patch(`/products/${id}/stock`, { updates }),
};

/* ------------------------------- Categories ------------------------------- */
export const categoryApi = {
  list: (params) => axiosClient.get(`/categories?${buildQuery(params)}`),
  detail: (slug) => axiosClient.get(`/categories/${slug}`),
  create: (payload) => axiosClient.post("/categories", payload),
  update: (id, payload) => axiosClient.put(`/categories/${id}`, payload),
  remove: (id) => axiosClient.delete(`/categories/${id}`),
};

/* ---------------------------------- Cart ---------------------------------- */
export const cartApi = {
  get: () => axiosClient.get("/cart"),
  add: (payload) => axiosClient.post("/cart/add", payload),
  update: (itemId, quantity) => axiosClient.put("/cart/update", { itemId, quantity }),
  remove: (itemId) => axiosClient.delete(`/cart/remove/${itemId}`),
  clear: () => axiosClient.delete("/cart/clear"),
  merge: (items) => axiosClient.post("/cart/merge", { items }),
};

/* --------------------------------- Orders --------------------------------- */
export const orderApi = {
  preview: (couponCode) => axiosClient.post("/orders/preview", { couponCode }),
  create: (payload) => axiosClient.post("/orders", payload),
  myOrders: (params) => axiosClient.get(`/orders/my-orders?${buildQuery(params)}`),
  detail: (id) => axiosClient.get(`/orders/${id}`),
  cancel: (id, reason) => axiosClient.put(`/orders/${id}/cancel`, { reason }),
  retryPayment: (id, method) => axiosClient.post(`/orders/${id}/retry-payment`, { method }),
  list: (params) => axiosClient.get(`/orders?${buildQuery(params)}`),
  updateStatus: (id, payload) => axiosClient.put(`/orders/${id}/status`, payload),
  vnpayReturn: (queryString) => axiosClient.get(`/orders/payment/vnpay-return?${queryString}`),
};

/* --------------------------------- Users ---------------------------------- */
export const userApi = {
  updateProfile: (payload) => axiosClient.put("/users/profile", payload),
  addresses: () => axiosClient.get("/users/addresses"),
  addAddress: (payload) => axiosClient.post("/users/addresses", payload),
  updateAddress: (id, payload) => axiosClient.put(`/users/addresses/${id}`, payload),
  removeAddress: (id) => axiosClient.delete(`/users/addresses/${id}`),
  wishlist: () => axiosClient.get("/users/wishlist"),
  toggleWishlist: (productId) => axiosClient.post(`/users/wishlist/${productId}`),
  list: (params) => axiosClient.get(`/users?${buildQuery(params)}`),
  detail: (id) => axiosClient.get(`/users/${id}`),
  update: (id, payload) => axiosClient.put(`/users/${id}`, payload),
  setBlocked: (id, isBlocked) => axiosClient.put(`/users/${id}/block`, { isBlocked }),
  remove: (id) => axiosClient.delete(`/users/${id}`),
};

/* -------------------------------- Reviews --------------------------------- */
export const reviewApi = {
  byProduct: (productId, params) =>
    axiosClient.get(`/reviews/product/${productId}?${buildQuery(params)}`),
  reviewable: () => axiosClient.get("/reviews/reviewable"),
  create: (payload) => axiosClient.post("/reviews", payload),
  update: (id, payload) => axiosClient.put(`/reviews/${id}`, payload),
  remove: (id) => axiosClient.delete(`/reviews/${id}`),
  listAll: (params) => axiosClient.get(`/reviews?${buildQuery(params)}`),
  approve: (id, isApproved, adminReply) =>
    axiosClient.put(`/reviews/${id}/approve`, { isApproved, adminReply }),
};

/* -------------------------------- Coupons --------------------------------- */
export const couponApi = {
  public: () => axiosClient.get("/coupons/public"),
  validate: (code, subtotal) => axiosClient.post("/coupons/validate", { code, subtotal }),
  list: (params) => axiosClient.get(`/coupons?${buildQuery(params)}`),
  create: (payload) => axiosClient.post("/coupons", payload),
  update: (id, payload) => axiosClient.put(`/coupons/${id}`, payload),
  remove: (id) => axiosClient.delete(`/coupons/${id}`),
};

/* -------------------------------- Banners --------------------------------- */
export const bannerApi = {
  home: () => axiosClient.get("/banners/home"),
  list: (params) => axiosClient.get(`/banners?${buildQuery(params)}`),
  create: (payload) => axiosClient.post("/banners", payload),
  update: (id, payload) => axiosClient.put(`/banners/${id}`, payload),
  remove: (id) => axiosClient.delete(`/banners/${id}`),
};

/* ------------------------------- Dashboard -------------------------------- */
export const dashboardApi = {
  stats: (days = 30) => axiosClient.get(`/admin/dashboard/stats?days=${days}`),
};

/* --------------------------------- Upload --------------------------------- */
const buildFormData = (files, folder) => {
  const form = new FormData();
  [...files].forEach((file) => form.append("images", file));
  if (folder) form.append("folder", folder);
  return form;
};

export const uploadApi = {
  images: (files, folder = "products") => uploadClient.post("/upload/image", buildFormData(files, folder)),
  publicImages: (files) => uploadClient.post("/upload/public", buildFormData(files)),
};
