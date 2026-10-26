import mongoose from "mongoose";

export const HOLD_LEVELS = ["low", "medium", "high", "extreme"];
export const FINISHES = ["matte", "shiny", "natural"];

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // "50g", "100g"
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, required: true, uppercase: true, trim: true },
  },
  { _id: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Vui lòng nhập tên sản phẩm"], trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    brand: { type: String, default: "Morris", trim: true },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "", maxlength: 400 },
    images: {
      type: [String],
      validate: [(v) => v.length > 0, "Sản phẩm cần ít nhất 1 ảnh"],
    },
    hairType: [{ type: String, trim: true }],
    holdLevel: { type: String, enum: HOLD_LEVELS, default: "medium", index: true },
    finish: { type: String, enum: FINISHES, default: "natural" },
    variants: {
      type: [variantSchema],
      validate: [(v) => v.length > 0, "Sản phẩm cần ít nhất 1 phiên bản"],
    },
    ingredients: { type: String, default: "" },
    howToUse: { type: String, default: "" },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },
    tags: [{ type: String, lowercase: true, trim: true, index: true }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

productSchema.index({ name: "text", tags: "text", shortDescription: "text", brand: "text" }, {
  weights: { name: 10, tags: 5, brand: 3, shortDescription: 1 },
  name: "product_text_index",
});
productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });

/** Gia hien thi thap nhat (uu tien gia sale) */
productSchema.virtual("minPrice").get(function minPrice() {
  if (!this.variants?.length) return 0;
  return Math.min(...this.variants.map((v) => (v.salePrice > 0 ? v.salePrice : v.price)));
});

productSchema.virtual("maxPrice").get(function maxPrice() {
  if (!this.variants?.length) return 0;
  return Math.max(...this.variants.map((v) => (v.salePrice > 0 ? v.salePrice : v.price)));
});

productSchema.virtual("basePrice").get(function basePrice() {
  return this.variants?.length ? this.variants[0].price : 0;
});

productSchema.virtual("totalStock").get(function totalStock() {
  return (this.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
});

productSchema.virtual("inStock").get(function inStock() {
  return (this.variants || []).some((v) => v.stock > 0);
});

productSchema.virtual("discountPercent").get(function discountPercent() {
  const v = this.variants?.[0];
  if (!v || !v.salePrice || v.salePrice >= v.price) return 0;
  return Math.round(((v.price - v.salePrice) / v.price) * 100);
});

productSchema.methods.findVariant = function findVariant(sku) {
  return this.variants.find((v) => v.sku === String(sku).toUpperCase());
};

export const Product = mongoose.model("Product", productSchema);
export default Product;
