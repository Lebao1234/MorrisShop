import Product from "../models/Product.js";

const activeOnly = (includeInactive) => (includeInactive ? {} : { isActive: true });

/**
 * Xay dung filter Mongo tu query string cua client.
 * Ho tro: category (slug hoac id), search, holdLevel, finish, hairType, tags, minPrice, maxPrice.
 */
export const buildProductFilter = ({
  categoryIds,
  search,
  holdLevel,
  finish,
  hairType,
  tags,
  minPrice,
  maxPrice,
  inStock,
  includeInactive = false,
} = {}) => {
  const filter = { ...activeOnly(includeInactive) };

  if (categoryIds?.length) filter.category = { $in: categoryIds };
  if (search) filter.$text = { $search: search };
  if (holdLevel?.length) filter.holdLevel = { $in: holdLevel };
  if (finish?.length) filter.finish = { $in: finish };
  if (hairType?.length) filter.hairType = { $in: hairType };
  if (tags?.length) filter.tags = { $in: tags };
  if (inStock) filter["variants.stock"] = { $gt: 0 };

  if (minPrice != null || maxPrice != null) {
    const range = {};
    if (minPrice != null) range.$gte = minPrice;
    if (maxPrice != null) range.$lte = maxPrice;
    filter["variants.price"] = range;
  }

  return filter;
};

export const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  bestseller: { soldCount: -1, ratingsAverage: -1 },
  rating: { ratingsAverage: -1, numReviews: -1 },
  "price-asc": { "variants.0.price": 1 },
  "price-desc": { "variants.0.price": -1 },
  name: { name: 1 },
};

export const findProducts = async (filter, { sort = "newest", skip = 0, limit = 12 } = {}) => {
  const sortSpec = filter.$text ? { score: { $meta: "textScore" } } : SORT_MAP[sort] || SORT_MAP.newest;
  const projection = filter.$text ? { score: { $meta: "textScore" } } : {};

  const [items, total] = await Promise.all([
    Product.find(filter, projection)
      .populate("category", "name slug")
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Product.countDocuments(filter),
  ]);

  return { items, total };
};

export const findBySlug = (slug) =>
  Product.findOne({ slug, isActive: true }).populate("category", "name slug");

export const findById = (id) => Product.findById(id).populate("category", "name slug");

export const findRelated = (product, limit = 4) =>
  Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { tags: { $in: product.tags || [] } }],
  })
    .sort({ soldCount: -1 })
    .limit(limit)
    .lean({ virtuals: true });

export const createProduct = (data) => Product.create(data);

export const updateProduct = (id, data) =>
  Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteProduct = (id) => Product.findByIdAndDelete(id);

export const findLowStock = (threshold = 5) =>
  Product.find({ isActive: true, "variants.stock": { $lte: threshold } })
    .select("name slug images variants")
    .lean();

export default {
  buildProductFilter,
  findProducts,
  findBySlug,
  findById,
  findRelated,
  createProduct,
  updateProduct,
  deleteProduct,
  findLowStock,
};
