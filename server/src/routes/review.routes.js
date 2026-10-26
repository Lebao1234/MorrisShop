import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParam } from "../validators/common.validator.js";
import {
  createReviewSchema,
  updateReviewSchema,
  approveReviewSchema,
} from "../validators/user.validator.js";

const router = Router();

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Danh gia da duyet cua mot san pham
 *     security: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: rating
 *         description: Loc theo so sao
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       200:
 *         description: "Danh sach danh gia. meta.breakdown chua so luot theo tung muc sao"
 */
router.get("/product/:productId", userController.getProductReviews);

/**
 * @swagger
 * /reviews/reviewable:
 *   get:
 *     tags: [Reviews]
 *     summary: San pham da nhan nhung chua danh gia
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sach san pham co the danh gia }
 */
router.get("/reviewable", protect, userController.getReviewableProducts);

/**
 * @swagger
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Tat ca danh gia, dung cho man hinh duyet (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: isApproved
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200: { description: Danh sach danh gia co phan trang }
 *   post:
 *     tags: [Reviews]
 *     summary: Viet danh gia (chi khach da nhan hang)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, rating, comment]
 *             properties:
 *               productId: { type: string }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, minLength: 10 }
 *               images:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201: { description: Danh gia dang cho duyet }
 *       403: { description: Chua mua/nhan san pham nay }
 *       409: { description: Da danh gia san pham nay roi }
 */
router
  .route("/")
  .get(protect, authorize("admin", "staff"), userController.listAllReviews)
  .post(protect, validate(createReviewSchema), userController.createReview);

/**
 * @swagger
 * /reviews/{id}/approve:
 *   put:
 *     tags: [Reviews]
 *     summary: Duyet / an danh gia (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isApproved]
 *             properties:
 *               isApproved: { type: boolean }
 *               adminReply: { type: string }
 *     responses:
 *       200: { description: Da cap nhat trang thai duyet }
 */
router.put(
  "/:id/approve",
  protect,
  authorize("admin", "staff"),
  validate(approveReviewSchema),
  userController.approveReview,
);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Sua danh gia cua chinh minh (se can duyet lai)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã cập nhật đánh giá }
 *   delete:
 *     tags: [Reviews]
 *     summary: Xoa danh gia (chu so huu hoac admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã xoá đánh giá }
 */
router
  .route("/:id")
  .put(protect, validate(updateReviewSchema), userController.updateReview)
  .delete(protect, validate({ params: idParam }), userController.deleteReview);

export default router;
