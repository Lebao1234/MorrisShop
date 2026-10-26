import slugify from "slugify";

export const toSlug = (str) => slugify(String(str), { lower: true, strict: true, locale: "vi" });

export const uniqueSlug = async (Model, name, excludeId = null) => {
  const base = toSlug(name);
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.exists(query);
    if (!exists) return slug;
    slug = `${base}-${i++}`;
  }
};

export const genOrderCode = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MRS${ymd}${rand}`;
};

export const genSku = (productName, variantName) =>
  `${toSlug(productName).slice(0, 12)}-${toSlug(variantName)}`.toUpperCase();

export const formatVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + "d";

export const pickPrice = (variant) =>
  variant?.salePrice && variant.salePrice > 0 ? variant.salePrice : variant?.price || 0;

export const parsePagination = (query, defaultLimit = 12, maxLimit = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};
