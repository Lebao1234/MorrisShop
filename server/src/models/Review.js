import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    images: [String],
    isApproved: { type: Boolean, default: false, index: true },
    adminReply: { type: String, default: "" },
  },
  { timestamps: true },
);

// Moi user chi danh gia 1 lan cho 1 san pham
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/** Tinh lai diem trung binh cho san pham (chi tinh review da duyet) */
reviewSchema.statics.recalcProductRating = async function recalcProductRating(productId) {
  const [stats] = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const Product = mongoose.model("Product");
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats ? Math.round(stats.avg * 10) / 10 : 0,
    numReviews: stats ? stats.count : 0,
  });
};

reviewSchema.post("save", function afterSave() {
  this.constructor.recalcProductRating(this.product);
});

reviewSchema.post("findOneAndUpdate", function afterUpdate(doc) {
  if (doc) doc.constructor.recalcProductRating(doc.product);
});

reviewSchema.post("findOneAndDelete", function afterDelete(doc) {
  if (doc) doc.constructor.recalcProductRating(doc.product);
});

export const Review = mongoose.model("Review", reviewSchema);
export default Review;
