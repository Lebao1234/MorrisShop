import Category from "../models/Category.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { uniqueSlug } from "../utils/helpers.js";

export const listCategories = async ({ includeInactive = false, tree = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ position: 1, name: 1 }).lean();

  if (!tree) return categories;

  const byId = new Map(categories.map((c) => [String(c._id), { ...c, children: [] }]));
  const roots = [];
  byId.forEach((cat) => {
    const parentId = cat.parentCategory && String(cat.parentCategory);
    if (parentId && byId.has(parentId)) byId.get(parentId).children.push(cat);
    else roots.push(cat);
  });
  return roots;
};

export const getBySlug = async (slug) => {
  const category = await Category.findOne({ slug }).lean();
  if (!category) throw ApiError.notFound("Không tìm thấy danh mục");
  return category;
};

/** Lay id cua danh muc + toan bo danh muc con (de loc san pham theo nhanh) */
export const getDescendantIds = async (slugOrId) => {
  const isObjectId = /^[a-f\d]{24}$/i.test(String(slugOrId));
  const root = await Category.findOne(isObjectId ? { _id: slugOrId } : { slug: slugOrId });
  if (!root) return [];

  const ids = [root._id];
  let frontier = [root._id];
  while (frontier.length) {
    const children = await Category.find({ parentCategory: { $in: frontier } }).select("_id").lean();
    frontier = children.map((c) => c._id);
    ids.push(...frontier);
  }
  return ids;
};

export const createCategory = async (data) => {
  const slug = await uniqueSlug(Category, data.slug || data.name);
  return Category.create({ ...data, slug });
};

export const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) throw ApiError.notFound("Không tìm thấy danh mục");

  if (String(data.parentCategory) === String(id)) {
    throw ApiError.badRequest("Danh mục không thể là cha của chính nó");
  }
  if (data.name && data.name !== category.name) {
    data.slug = await uniqueSlug(Category, data.slug || data.name, id);
  }
  Object.assign(category, data);
  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const [productCount, childCount] = await Promise.all([
    Product.countDocuments({ category: id }),
    Category.countDocuments({ parentCategory: id }),
  ]);
  if (productCount > 0) throw ApiError.badRequest(`Danh mục đang chứa ${productCount} sản phẩm`);
  if (childCount > 0) throw ApiError.badRequest("Danh mục đang có danh mục con");

  const deleted = await Category.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Không tìm thấy danh mục");
  return deleted;
};

export default { listCategories, getBySlug, getDescendantIds, createCategory, updateCategory, deleteCategory };
