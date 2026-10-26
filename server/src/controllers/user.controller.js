import asyncHandler from "../utils/asyncHandler.js";
import { ok, created, paginated, noContent } from "../utils/response.js";
import * as userService from "../services/user.service.js";
import * as reviewService from "../services/review.service.js";
import * as bannerService from "../services/banner.service.js";
import { storeFiles } from "../middlewares/upload.js";
import ApiError from "../utils/ApiError.js";

/* ------------------------------- Users -------------------------------- */

export const listUsers = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await userService.listUsers(req.query);
  // Loai bo truong nhay cam truoc khi tra ve client
  const safeItems = items.map(({ password: _p, refreshToken: _r, ...rest }) => rest);
  return paginated(res, safeItems, { page, limit, total });
});

export const getUser = asyncHandler(async (req, res) => ok(res, await userService.getUser(req.params.id)));

export const updateProfile = asyncHandler(async (req, res) =>
  ok(res, await userService.updateProfile(req.user._id, req.body), "Đã cập nhật hồ sơ"),
);

export const adminUpdateUser = asyncHandler(async (req, res) =>
  ok(res, await userService.adminUpdateUser(req.params.id, req.body), "Đã cập nhật người dùng"),
);

export const blockUser = asyncHandler(async (req, res) => {
  const user = await userService.setBlocked(req.params.id, req.body.isBlocked, req.user._id);
  return ok(res, user, req.body.isBlocked ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản");
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user._id);
  return noContent(res, "Đã xoá người dùng");
});

/* ------------------------------ Dia chi ------------------------------- */

export const getAddresses = asyncHandler(async (req, res) => ok(res, req.user.addresses));

export const addAddress = asyncHandler(async (req, res) =>
  created(res, await userService.addAddress(req.user._id, req.body), "Đã thêm địa chỉ"),
);

export const updateAddress = asyncHandler(async (req, res) =>
  ok(res, await userService.updateAddress(req.user._id, req.params.addressId, req.body), "Đã cập nhật địa chỉ"),
);

export const deleteAddress = asyncHandler(async (req, res) =>
  ok(res, await userService.deleteAddress(req.user._id, req.params.addressId), "Đã xoá địa chỉ"),
);

/* ------------------------------ Wishlist ------------------------------ */

export const getWishlist = asyncHandler(async (req, res) => ok(res, await userService.getWishlist(req.user._id)));

export const toggleWishlist = asyncHandler(async (req, res) => {
  const result = await userService.toggleWishlist(req.user._id, req.params.productId);
  return ok(res, result, result.added ? "Đã thêm vào danh sách yêu thích" : "Đã bỏ khỏi danh sách yêu thích");
});

/* ------------------------------- Reviews ------------------------------ */

export const getProductReviews = asyncHandler(async (req, res) => {
  const { items, total, page, limit, breakdown } = await reviewService.listByProduct(
    req.params.productId,
    req.query,
  );
  return ok(res, items, "Thành công", {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    breakdown,
  });
});

export const getReviewBreakdown = asyncHandler(async (req, res) => {
  const { breakdown, total } = await reviewService.listByProduct(req.params.productId, { limit: 1 });
  return ok(res, { breakdown, total });
});

export const listAllReviews = asyncHandler(async (req, res) => {
  const { items, total, page, limit } = await reviewService.listAll(req.query);
  return paginated(res, items, { page, limit, total });
});

export const createReview = asyncHandler(async (req, res) =>
  created(res, await reviewService.createReview(req.user._id, req.body), "Cảm ơn bạn! Đánh giá đang chờ duyệt"),
);

export const updateReview = asyncHandler(async (req, res) =>
  ok(res, await reviewService.updateOwnReview(req.user._id, req.params.id, req.body), "Đã cập nhật đánh giá"),
);

export const approveReview = asyncHandler(async (req, res) =>
  ok(
    res,
    await reviewService.setApproval(req.params.id, req.body.isApproved, req.body.adminReply),
    req.body.isApproved ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá",
  ),
);

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user);
  return noContent(res, "Đã xoá đánh giá");
});

export const getReviewableProducts = asyncHandler(async (req, res) =>
  ok(res, await reviewService.getReviewableProducts(req.user._id)),
);

/* ------------------------------- Banners ------------------------------ */

export const getBanners = asyncHandler(async (req, res) => {
  const isStaff = ["admin", "staff"].includes(req.user?.role);
  return ok(
    res,
    await bannerService.listBanners({
      type: req.query.type,
      includeInactive: isStaff && req.query.includeInactive === "true",
    }),
  );
});

export const getHomeContent = asyncHandler(async (_req, res) => ok(res, await bannerService.getHomeContent()));

export const createBanner = asyncHandler(async (req, res) =>
  created(res, await bannerService.createBanner(req.body), "Đã tạo banner"),
);

export const updateBanner = asyncHandler(async (req, res) =>
  ok(res, await bannerService.updateBanner(req.params.id, req.body), "Đã cập nhật banner"),
);

export const deleteBanner = asyncHandler(async (req, res) => {
  await bannerService.deleteBanner(req.params.id);
  return noContent(res, "Đã xoá banner");
});

/* ------------------------------- Upload ------------------------------- */

export const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files?.length ? req.files : req.file ? [req.file] : [];
  if (!files.length) throw ApiError.badRequest("Không có file nào được gửi lên");

  const folder = req.body.folder || "products";
  const results = await storeFiles(files, folder);

  return created(res, { images: results, urls: results.map((r) => r.url) }, "Tải ảnh lên thành công");
});
