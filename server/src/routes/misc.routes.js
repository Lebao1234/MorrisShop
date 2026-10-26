import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import * as userController from "../controllers/user.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParam } from "../validators/common.validator.js";
import { upload } from "../middlewares/upload.js";
import {
  validateCouponSchema,
  createCouponSchema,
  updateCouponSchema,
} from "../validators/order.validator.js";
import { createBannerSchema, updateBannerSchema } from "../validators/user.validator.js";

/* ------------------------------- Coupons ------------------------------- */
export const couponRouter = Router();

/**
 * @swagger
 * /coupons/public:
 *   get:
 *     tags: [Coupons]
 *     summary: Ma giam gia dang chay (hien thi o trang gio hang)
 *     security: []
 *     responses:
 *       200: { description: Danh sach ma giam gia cong khai }
 */
couponRouter.get("/public", orderController.getPublicCoupons);

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: Kiem tra ma giam gia truoc khi ap dung
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code: { type: string }
 *               subtotal:
 *                 type: number
 *                 description: Neu bo trong se lay tam tinh tu gio hang tren server
 *     responses:
 *       200: { description: "{ coupon, discount, finalSubtotal }" }
 *       400: { description: Ma het han / chua dat giá trị toi thieu / het luot }
 *       404: { description: Ma khong ton tai }
 */
couponRouter.post("/validate", protect, validate(validateCouponSchema), orderController.validateCoupon);

/**
 * @swagger
 * /coupons:
 *   get:
 *     tags: [Coupons]
 *     summary: Danh sach ma giam gia (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sach co phan trang }
 *   post:
 *     tags: [Coupons]
 *     summary: Tao ma giam gia (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CouponInput' }
 *     responses:
 *       201: { description: Đã tạo mã giảm giá }
 */
couponRouter
  .route("/")
  .get(protect, authorize("admin", "staff"), orderController.listCoupons)
  .post(protect, authorize("admin"), validate(createCouponSchema), orderController.createCoupon);

/**
 * @swagger
 * /coupons/{id}:
 *   put:
 *     tags: [Coupons]
 *     summary: Cap nhat ma giam gia (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Da cap nhat }
 *   delete:
 *     tags: [Coupons]
 *     summary: Xoa ma giam gia (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã xoá }
 */
couponRouter
  .route("/:id")
  .put(protect, authorize("admin"), validate(updateCouponSchema), orderController.updateCoupon)
  .delete(protect, authorize("admin"), validate({ params: idParam }), orderController.deleteCoupon);

/* ------------------------------- Banners ------------------------------- */
export const bannerRouter = Router();

/**
 * @swagger
 * /banners:
 *   get:
 *     tags: [Banners]
 *     summary: Danh sach banner / noi dung trang chu
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [hero_video, hero_image, collection_banner, promo, story]
 *     responses:
 *       200: { description: Danh sach banner }
 *   post:
 *     tags: [Banners]
 *     summary: Tao banner (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, mediaUrl]
 *             properties:
 *               type: { type: string }
 *               title: { type: string }
 *               subtitle: { type: string }
 *               eyebrow: { type: string }
 *               ctaLabel: { type: string }
 *               mediaUrl: { type: string }
 *               posterUrl: { type: string }
 *               linkUrl: { type: string }
 *               position: { type: integer }
 *               isActive: { type: boolean }
 *     responses:
 *       201: { description: Đã tạo banner }
 */
bannerRouter
  .route("/")
  .get(optionalAuth, userController.getBanners)
  .post(protect, authorize("admin"), validate(createBannerSchema), userController.createBanner);

/**
 * @swagger
 * /banners/home:
 *   get:
 *     tags: [Banners]
 *     summary: Noi dung trang chu gom theo type (1 request duy nhat)
 *     security: []
 *     responses:
 *       200: { description: "{ hero_video: [], collection_banner: [], ... }" }
 */
bannerRouter.get("/home", userController.getHomeContent);

/**
 * @swagger
 * /banners/{id}:
 *   put:
 *     tags: [Banners]
 *     summary: Cap nhat banner (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Da cap nhat }
 *   delete:
 *     tags: [Banners]
 *     summary: Xoa banner (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã xoá }
 */
bannerRouter
  .route("/:id")
  .put(protect, authorize("admin"), validate(updateBannerSchema), userController.updateBanner)
  .delete(protect, authorize("admin"), validate({ params: idParam }), userController.deleteBanner);

/* ------------------------------ Dashboard ------------------------------ */
export const dashboardRouter = Router();

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Thong ke tong quan cho admin
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         description: So ngay tinh doanh thu gan nhat
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: "{ summary, revenueByDay, statusBreakdown, topProducts }"
 *       403: { description: Khong du quyen }
 */
dashboardRouter.get("/stats", protect, authorize("admin", "staff"), orderController.getDashboardStats);

/* -------------------------------- Upload ------------------------------- */
export const uploadRouter = Router();

/**
 * @swagger
 * /upload/image:
 *   post:
 *     tags: [Upload]
 *     summary: Tai anh len Cloudinary (toi da 10 file, moi file 5MB)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *               folder:
 *                 type: string
 *                 description: "Thu muc luu tru (products, banners, avatars, reviews)"
 *     responses:
 *       201: { description: "{ images: [{url, publicId}], urls: [] }" }
 *       400: { description: Sai dinh dang hoac vuot dung luong }
 */
uploadRouter.post(
  "/image",
  protect,
  authorize("admin", "staff"),
  upload.array("images", 10),
  userController.uploadImages,
);

/**
 * @swagger
 * /upload/public:
 *   post:
 *     tags: [Upload]
 *     summary: Tai anh len cho khach hang (avatar, anh danh gia) - toi da 5 file
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Tai anh thanh cong }
 */
uploadRouter.post("/public", protect, upload.array("images", 5), userController.uploadImages);

export default { couponRouter, bannerRouter, dashboardRouter, uploadRouter };
