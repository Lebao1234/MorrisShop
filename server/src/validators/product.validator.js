import { z } from "zod";
import { objectId } from "./common.validator.js";
import { HOLD_LEVELS, FINISHES } from "../models/Product.js";

const variantSchema = z.object({
  name: z.string().trim().min(1, "Tên phiên bản không được trống"),
  price: z.coerce.number().min(0, "Giá phải lớn hơn 0"),
  salePrice: z.coerce.number().min(0).optional().default(0),
  stock: z.coerce.number().int().min(0).optional().default(0),
  sku: z.string().trim().optional(),
});

const baseProduct = {
  name: z.string().trim().min(2, "Tên sản phẩm quá ngắn").max(180),
  slug: z.string().trim().optional(),
  category: objectId,
  brand: z.string().trim().optional(),
  description: z.string().optional(),
  shortDescription: z.string().max(400).optional(),
  images: z.array(z.string().min(1)).min(1, "Cần ít nhất 1 ảnh sản phẩm"),
  hairType: z.array(z.string()).optional(),
  holdLevel: z.enum(HOLD_LEVELS).optional(),
  finish: z.enum(FINISHES).optional(),
  variants: z.array(variantSchema).min(1, "Cần ít nhất 1 phiên bản"),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
};

export const createProductSchema = { body: z.object(baseProduct) };

export const updateProductSchema = {
  params: z.object({ id: objectId }),
  body: z.object(baseProduct).partial().refine((v) => Object.keys(v).length > 0, {
    message: "Không có dữ liệu để cập nhật",
  }),
};

export const listProductQuery = {
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
      category: z.string().optional(),
      search: z.string().optional(),
      holdLevel: z.string().optional(),
      finish: z.string().optional(),
      hairType: z.string().optional(),
      tags: z.string().optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      inStock: z.enum(["true", "false"]).optional(),
      sort: z
        .enum(["newest", "oldest", "bestseller", "rating", "price-asc", "price-desc", "name"])
        .optional(),
      includeInactive: z.enum(["true", "false"]).optional(),
    })
    .passthrough(),
};

export const updateStockSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    updates: z
      .array(
        z.object({
          sku: z.string().trim().min(1),
          stock: z.coerce.number().int().min(0).optional(),
          delta: z.coerce.number().int().optional(),
        }),
      )
      .min(1, "Không có dữ liệu tồn kho"),
  }),
};

export const createCategorySchema = {
  body: z.object({
    name: z.string().trim().min(2, "Tên danh mục quá ngắn").max(120),
    slug: z.string().trim().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    parentCategory: objectId.nullable().optional(),
    position: z.coerce.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateCategorySchema = {
  params: z.object({ id: objectId }),
  body: createCategorySchema.body.partial(),
};
