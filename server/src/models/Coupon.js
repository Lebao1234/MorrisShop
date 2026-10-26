import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 }, // 0 = khong gioi han
    usageLimit: { type: Number, default: 0, min: 0 }, // 0 = khong gioi han
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 0, min: 0 },
    usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, count: Number }],
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/** Tinh so tien duoc giam cho giá trị don hang */
couponSchema.methods.calcDiscount = function calcDiscount(subtotal) {
  let discount = this.type === "percent" ? (subtotal * this.value) / 100 : this.value;
  if (this.maxDiscount > 0) discount = Math.min(discount, this.maxDiscount);
  return Math.max(0, Math.min(Math.round(discount), subtotal));
};

/** Kiem tra kha dung, tra ve { valid, reason } */
couponSchema.methods.checkUsable = function checkUsable(subtotal, userId) {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: "Mã giảm giá đã bị vô hiệu hoá" };
  if (this.startsAt && now < this.startsAt) return { valid: false, reason: "Mã giảm giá chưa bắt đầu" };
  if (this.expiresAt && now > this.expiresAt) return { valid: false, reason: "Mã giảm giá đã hết hạn" };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit)
    return { valid: false, reason: "Mã giảm giá đã hết lượt sử dụng" };
  if (subtotal < this.minOrderValue)
    return {
      valid: false,
      reason: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(this.minOrderValue)}d`,
    };
  if (this.perUserLimit > 0 && userId) {
    const used = this.usedBy.find((u) => String(u.user) === String(userId));
    if (used && used.count >= this.perUserLimit)
      return { valid: false, reason: "Bạn đã dùng hết lượt cho mã này" };
  }
  return { valid: true, reason: null };
};

export const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
