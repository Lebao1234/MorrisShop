import Coupon from "../models/Coupon.js";
import ApiError from "../utils/ApiError.js";
import { parsePagination } from "../utils/helpers.js";

export const validateCoupon = async ({ code, subtotal, userId }) => {
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
  if (!coupon) throw ApiError.notFound("Mã giảm giá không tồn tại");

  const { valid, reason } = coupon.checkUsable(subtotal, userId);
  if (!valid) throw ApiError.badRequest(reason);

  const discount = coupon.calcDiscount(subtotal);
  return {
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
    },
    discount,
    finalSubtotal: subtotal - discount,
  };
};

/** Ghi nhan luot dung sau khi don hang duoc tao thanh cong */
export const consumeCoupon = async (couponId, userId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return null;

  coupon.usedCount += 1;
  const entry = coupon.usedBy.find((u) => String(u.user) === String(userId));
  if (entry) entry.count += 1;
  else coupon.usedBy.push({ user: userId, count: 1 });

  await coupon.save();
  return coupon;
};

/** Hoan luot dung khi huy don */
export const releaseCoupon = async (couponId, userId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return null;

  coupon.usedCount = Math.max(0, coupon.usedCount - 1);
  const entry = coupon.usedBy.find((u) => String(u.user) === String(userId));
  if (entry) entry.count = Math.max(0, entry.count - 1);

  await coupon.save();
  return coupon;
};

export const listCoupons = async (query) => {
  const { page, limit, skip } = parsePagination(query, 20);
  const filter = {};
  if (query.search) filter.code = new RegExp(String(query.search).trim(), "i");
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true" || query.isActive === true;

  const [items, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);
  return { items, total, page, limit };
};

/** Ma giam gia dang chay - hien thi cong khai o trang gio hang */
export const listPublicCoupons = () =>
  Coupon.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
    startsAt: { $lte: new Date() },
  })
    .select("code description type value minOrderValue maxDiscount expiresAt")
    .sort({ minOrderValue: 1 })
    .limit(6)
    .lean();

export const createCoupon = async (data) => {
  const code = String(data.code).toUpperCase().trim();
  if (await Coupon.exists({ code })) throw ApiError.conflict("Mã giảm giá đã tồn tại");
  if (data.type === "percent" && data.value > 100) throw ApiError.badRequest("Phần trăm giảm tối đa là 100");
  return Coupon.create({ ...data, code });
};

export const updateCoupon = async (id, data) => {
  if (data.code) data.code = String(data.code).toUpperCase().trim();
  const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!coupon) throw ApiError.notFound("Không tìm thấy mã giảm giá");
  return coupon;
};

export const deleteCoupon = async (id) => {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw ApiError.notFound("Không tìm thấy mã giảm giá");
  return coupon;
};

export default {
  validateCoupon,
  consumeCoupon,
  releaseCoupon,
  listCoupons,
  listPublicCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
