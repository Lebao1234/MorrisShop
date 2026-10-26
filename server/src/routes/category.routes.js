import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParam, slugParam } from "../validators/common.validator.js";
import { createCategorySchema, updateCategorySchema } from "../validators/product.validator.js";

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Danh sach danh muc
 *     security: []
 *     parameters:
 *       - in: query
 *         name: tree
 *         description: Tra ve dang cay (danh muc cha chua children)
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200:
 *         description: Danh sach danh muc
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Category' }
 *   post:
 *     tags: [Categories]
 *     summary: Tao danh muc (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       201: { description: Đã tạo danh mục }
 *       403: { description: Khong du quyen }
 */
router
  .route("/")
  .get(optionalAuth, productController.getCategories)
  .post(protect, authorize("admin"), validate(createCategorySchema), productController.createCategory);

/**
 * @swagger
 * /categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Chi tiet danh muc theo slug
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Chi tiet danh muc }
 *       404: { description: Không tìm thấy danh mục }
 */
router.get("/:slug", validate({ params: slugParam }), productController.getCategoryBySlug);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Cap nhat danh muc (admin)
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
 *           schema: { $ref: '#/components/schemas/CategoryInput' }
 *     responses:
 *       200: { description: Da cap nhat }
 *   delete:
 *     tags: [Categories]
 *     summary: Xoa danh muc (admin) - chi khi khong con san pham/danh muc con
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã xoá }
 *       400: { description: Danh muc con chua san pham hoac danh muc con }
 */
router
  .route("/:id")
  .put(protect, authorize("admin"), validate(updateCategorySchema), productController.updateCategory)
  .delete(protect, authorize("admin"), validate({ params: idParam }), productController.deleteCategory);

export default router;
