import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import * as productRepo from "../repositories/product.repository.js";
import * as categoryService from "./category.service.js";
import { uniqueSlug, genSku } from "../utils/helpers.js";
import { parsePagination } from "../utils/helpers.js";

const toArray = (v) => (v == null ? undefined : Array.isArray(v) ? v : String(v).split(",").filter(Boolean));

export const listProducts = async (query, { includeInactive = false } = {}) => {
  const { page, limit, skip } = parsePagination(query, 12);

  let categoryIds;
  if (query.category) {
    categoryIds = await categoryService.getDescendantIds(query.category);
    if (!categoryIds.length) return { items: [], total: 0, page, limit };
  }

  const filter = productRepo.buildProductFilter({
    categoryIds,
    search: query.search?.trim(),
    holdLevel: toArray(query.holdLevel),
    finish: toArray(query.finish),
    hairType: toArray(query.hairType),
    tags: toArray(query.tags),
    minPrice: query.minPrice != null ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice != null ? Number(query.maxPrice) : undefined,
    inStock: query.inStock === true || query.inStock === "true",
    includeInactive,
  });

  const { items, total } = await productRepo.findProducts(filter, { sort: query.sort, skip, limit });
  return { items, total, page, limit };
};

export const getProductBySlug = async (slug) => {
  const product = await productRepo.findBySlug(slug);
  if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");
  return product;
};

export const getRelated = async (id, limit = 4) => {
  const product = await productRepo.findById(id);
  if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");
  return productRepo.findRelated(product, limit);
};

const normalizeVariants = (variants, productName) =>
  (variants || []).map((v) => ({
    ...v,
    salePrice: v.salePrice || 0,
    sku: (v.sku || genSku(productName, v.name)).toUpperCase(),
  }));

export const createProduct = async (data) => {
  const slug = await uniqueSlug(Product, data.slug || data.name);
  const variants = normalizeVariants(data.variants, data.name);

  const skus = variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) throw ApiError.badRequest("SKU của các phiên bản bị trùng");

  return Product.create({ ...data, slug, variants });
};

export const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");

  if (data.name && data.name !== product.name) {
    data.slug = await uniqueSlug(Product, data.slug || data.name, id);
  }
  if (data.variants) {
    data.variants = normalizeVariants(data.variants, data.name || product.name);
  }
  Object.assign(product, data);
  await product.save();
  return product.populate("category", "name slug");
};

export const deleteProduct = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");
  return product;
};

/** Cap nhat ton kho theo tung variant: [{ sku, stock }] hoac { sku, delta } */
export const updateStock = async (id, updates) => {
  const product = await Product.findById(id);
  if (!product) throw ApiError.notFound("Không tìm thấy sản phẩm");

  for (const u of updates) {
    const variant = product.findVariant(u.sku);
    if (!variant) throw ApiError.badRequest(`Không tìm thấy phiên bản SKU ${u.sku}`);
    if (u.stock != null) variant.stock = u.stock;
    else if (u.delta != null) variant.stock = Math.max(0, variant.stock + u.delta);
  }
  await product.save();
  return product;
};

/** Lay san pham noi bat cho trang chu */
export const getHomeShowcase = async () => {
  const [bestSellers, newArrivals] = await Promise.all([
    Product.find({ isActive: true })
      .sort({ soldCount: -1, ratingsAverage: -1 })
      .limit(8)
      .populate("category", "name slug")
      .lean({ virtuals: true }),
    Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("category", "name slug")
      .lean({ virtuals: true }),
  ]);
  return { bestSellers, newArrivals };
};

export default {
  listProducts,
  getProductBySlug,
  getRelated,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  getHomeShowcase,
};
