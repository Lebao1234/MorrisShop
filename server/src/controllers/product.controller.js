import asyncHandler from "../utils/asyncHandler.js";
import { ok, created, paginated, noContent } from "../utils/response.js";
import * as productService from "../services/product.service.js";
import * as categoryService from "../services/category.service.js";
import Product from "../models/Product.js";
import { env } from "../config/env.js";

/* ------------------------------ San pham ------------------------------ */

export const getProducts = asyncHandler(async (req, res) => {
  const isStaff = ["admin", "staff"].includes(req.user?.role);
  const includeInactive = isStaff && req.query.includeInactive === "true";

  const { items, total, page, limit } = await productService.listProducts(req.query, { includeInactive });
  return paginated(res, items, { page, limit, total });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await productService.getProductBySlug(req.params.slug);
  return ok(res, product);
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const items = await productService.getRelated(req.params.id, Number(req.query.limit) || 4);
  return ok(res, items);
});

export const getShowcase = asyncHandler(async (_req, res) => {
  const data = await productService.getHomeShowcase();
  return ok(res, data);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  return created(res, product, "Đã tạo sản phẩm");
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  return ok(res, product, "Đã cập nhật sản phẩm");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  return noContent(res, "Đã xoá sản phẩm");
});

export const updateStock = asyncHandler(async (req, res) => {
  const product = await productService.updateStock(req.params.id, req.body.updates);
  return ok(res, product, "Đã cập nhật tồn kho");
});

export const getLowStock = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || env.lowStockThreshold;
  const items = await Product.find({ isActive: true, "variants.stock": { $lte: threshold } })
    .select("name slug images variants")
    .lean();
  return ok(res, { threshold, items });
});

/** Goi y tim kiem nhanh cho o search (debounce tren client) */
export const searchSuggestions = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) return ok(res, []);

  const items = await Product.find({
    isActive: true,
    $or: [{ name: new RegExp(q, "i") }, { tags: new RegExp(q, "i") }],
  })
    .select("name slug images variants")
    .limit(6)
    .lean({ virtuals: true });

  return ok(res, items);
});

/* ------------------------------ Danh muc ------------------------------ */

export const getCategories = asyncHandler(async (req, res) => {
  const isStaff = ["admin", "staff"].includes(req.user?.role);
  const items = await categoryService.listCategories({
    includeInactive: isStaff && req.query.includeInactive === "true",
    tree: req.query.tree === "true",
  });
  return ok(res, items);
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await categoryService.getBySlug(req.params.slug);
  return ok(res, category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return created(res, category, "Đã tạo danh mục");
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return ok(res, category, "Đã cập nhật danh mục");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  return noContent(res, "Đã xoá danh mục");
});
