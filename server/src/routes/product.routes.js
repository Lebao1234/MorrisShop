import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { protect, authorize, optionalAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParam, slugParam } from "../validators/common.validator.js";
import {
  createProductSchema,
  updateProductSchema,
  listProductQuery,
  updateStockSchema,
} from "../validators/product.validator.js";

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Danh sach san pham (loc, tim kiem, sap xep, phan trang)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12, maximum: 100 }
 *       - in: query
 *         name: category
 *         description: Slug hoac ID danh muc (bao gom ca danh muc con)
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         description: Tu khoa tim kiem (MongoDB text index)
 *         schema: { type: string }
 *       - in: query
 *         name: holdLevel
 *         description: Do giu nep, ngan cach bang dau phay
 *         schema: { type: string, example: "medium,high" }
 *       - in: query
 *         name: finish
 *         schema: { type: string, example: "matte,natural" }
 *       - in: query
 *         name: hairType
 *         schema: { type: string, example: "toc thang,toc xoan" }
 *       - in: query
 *         name: tags
 *         schema: { type: string, example: "bestseller,new" }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: inStock
 *         schema: { type: string, enum: ["true", "false"] }
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, bestseller, rating, price-asc, price-desc, name]
 *     responses:
 *       200:
 *         description: Danh sach san pham co phan trang
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Product' }
 *   post:
 *     tags: [Products]
 *     summary: Tao san pham moi (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       201: { description: Tao thanh cong }
 *       401: { description: Chua dang nhap }
 *       403: { description: Khong du quyen }
 */
router
  .route("/")
  .get(optionalAuth, validate(listProductQuery), productController.getProducts)
  .post(protect, authorize("admin"), validate(createProductSchema), productController.createProduct);

/**
 * @swagger
 * /products/showcase:
 *   get:
 *     tags: [Products]
 *     summary: San pham ban chay va moi nhat cho trang chu
 *     security: []
 *     responses:
 *       200: { description: "{ bestSellers, newArrivals }" }
 */
router.get("/showcase", productController.getShowcase);

/**
 * @swagger
 * /products/suggestions:
 *   get:
 *     tags: [Products]
 *     summary: Goi y tim kiem nhanh cho o search
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, minLength: 2 }
 *     responses:
 *       200: { description: Toi da 6 san pham goi y }
 */
router.get("/suggestions", productController.searchSuggestions);

/**
 * @swagger
 * /products/low-stock:
 *   get:
 *     tags: [Products]
 *     summary: San pham sap het hang (admin/staff)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema: { type: integer, default: 5 }
 *     responses:
 *       200: { description: Danh sach san pham ton kho thap }
 */
router.get("/low-stock", protect, authorize("admin", "staff"), productController.getLowStock);

/**
 * @swagger
 * /products/{id}/related:
 *   get:
 *     tags: [Products]
 *     summary: San pham lien quan
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 4 }
 *     responses:
 *       200: { description: Danh sach san pham lien quan }
 *       404: { description: Không tìm thấy sản phẩm }
 */
router.get("/:id/related", validate({ params: idParam }), productController.getRelatedProducts);

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Cap nhat ton kho theo variant (admin/staff)
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
 *             required: [updates]
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku: { type: string }
 *                     stock: { type: integer, description: "Dat ton kho ve giá trị tuyet doi" }
 *                     delta: { type: integer, description: "Cong/tru tuong doi" }
 *     responses:
 *       200: { description: Đã cập nhật tồn kho }
 */
router.patch(
  "/:id/stock",
  protect,
  authorize("admin", "staff"),
  validate(updateStockSchema),
  productController.updateStock,
);

/**
 * @swagger
 * /products/{slug}:
 *   get:
 *     tags: [Products]
 *     summary: Chi tiet san pham theo slug
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiet san pham
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Product' }
 *       404: { description: Không tìm thấy sản phẩm }
 */
router.get("/:slug", validate({ params: slugParam }), productController.getProductBySlug);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Cap nhat san pham (admin)
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
 *           schema: { $ref: '#/components/schemas/ProductInput' }
 *     responses:
 *       200: { description: Da cap nhat }
 *       404: { description: Không tìm thấy sản phẩm }
 *   delete:
 *     tags: [Products]
 *     summary: Xoa san pham (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã xoá }
 */
router
  .route("/:id")
  .put(protect, authorize("admin"), validate(updateProductSchema), productController.updateProduct)
  .delete(protect, authorize("admin"), validate({ params: idParam }), productController.deleteProduct);

export default router;
