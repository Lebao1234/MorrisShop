import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { parsePagination } from "../utils/helpers.js";
import * as orderRepo from "../repositories/order.repository.js";

export const listByProduct = async (productId, query) => {
  const { page, limit, skip } = parsePagination(query, 8);
  const filter = { product: productId, isApproved: true };
  if (query.rating) filter.rating = Number(query.rating);

  const [items, total, breakdown] = await Promise.all([
    Review.find(filter)
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(String(productId)), isApproved: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
  ]);

  const stars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  breakdown.forEach((b) => {
    stars[b._id] = b.count;
  });

  return { items, total, page, limit, breakdown: stars };
};

/** Danh sach cho admin duyet */
export const listAll = async (query) => {
  const { page, limit, skip } = parsePagination(query, 15);
  const filter = {};
  if (query.isApproved !== undefined) {
    filter.isApproved = query.isApproved === "true" || query.isApproved === true;
  }
  if (query.rating) filter.rating = Number(query.rating);

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "name email avatar")
      .populate("product", "name slug images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);
  return { items, total, page, limit };
};

/** Chi khach da nhan hang moi duoc danh gia */
export const createReview = async (userId, { productId, rating, comment, images = [] }) => {
  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound("Sản phẩm không tồn tại");

  const purchased = await orderRepo.hasPurchased(userId, productId);
  if (!purchased) {
    throw ApiError.forbidden("Chỉ khách hàng đã nhận sản phẩm này mới có thể đánh giá");
  }

  const existing = await Review.findOne({ product: productId, user: userId });
  if (existing) throw ApiError.conflict("Bạn đã đánh giá sản phẩm này rồi");

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    comment,
    images,
    isApproved: false,
  });

  return review.populate("user", "name avatar");
};

export const updateOwnReview = async (userId, reviewId, data) => {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound("Không tìm thấy đánh giá");
  if (String(review.user) !== String(userId)) throw ApiError.forbidden();

  Object.assign(review, { ...data, isApproved: false }); // sua xong phai duyet lai
  await review.save();
  return review;
};

export const setApproval = async (reviewId, isApproved, adminReply) => {
  const review = await Review.findByIdAndUpdate(
    reviewId,
    { isApproved, ...(adminReply !== undefined ? { adminReply } : {}) },
    { new: true },
  );
  if (!review) throw ApiError.notFound("Không tìm thấy đánh giá");
  await Review.recalcProductRating(review.product);
  return review;
};

export const deleteReview = async (reviewId, requester) => {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound("Không tìm thấy đánh giá");

  const isOwner = String(review.user) === String(requester._id);
  if (!isOwner && requester.role !== "admin") throw ApiError.forbidden();

  await Review.findByIdAndDelete(reviewId);
  await Review.recalcProductRating(review.product);
  return review;
};

/** San pham khach da mua nhung chua danh gia */
export const getReviewableProducts = async (userId) => {
  const delivered = await Order.find({ user: userId, orderStatus: "delivered" })
    .select("items.product items.name items.image items.slug")
    .lean();

  const reviewed = await Review.find({ user: userId }).select("product").lean();
  const reviewedIds = new Set(reviewed.map((r) => String(r.product)));

  const seen = new Map();
  delivered.forEach((order) => {
    order.items.forEach((item) => {
      const id = String(item.product);
      if (!reviewedIds.has(id) && !seen.has(id)) {
        seen.set(id, { product: item.product, name: item.name, image: item.image, slug: item.slug });
      }
    });
  });

  return [...seen.values()];
};

export default {
  listByProduct,
  listAll,
  createReview,
  updateOwnReview,
  setApproval,
  deleteReview,
  getReviewableProducts,
};
