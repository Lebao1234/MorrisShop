import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { addToCartSchema, updateCartSchema, mergeCartSchema } from "../validators/order.validator.js";

const router = Router();
router.use(protect); // toan bo gio hang yeu cau dang nhap

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Lay gio hang hien tai (da dong bo gia va ton kho moi nhat)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Gio hang
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Cart' }
 */
router.get("/", orderController.getCart);

/**
 * @swagger
 * /cart/add:
 *   post:
 *     tags: [Cart]
 *     summary: Them san pham vao gio hang
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, variantSku]
 *             properties:
 *               productId: { type: string }
 *               variantSku: { type: string }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Gio hang sau khi them }
 *       400: { description: Khong du ton kho hoac variant khong hop le }
 */
router.post("/add", validate(addToCartSchema), orderController.addToCart);

/**
 * @swagger
 * /cart/update:
 *   put:
 *     tags: [Cart]
 *     summary: Cap nhat so luong mot dong trong gio (quantity = 0 se xoa dong do)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, quantity]
 *             properties:
 *               itemId: { type: string }
 *               quantity: { type: integer, minimum: 0 }
 *     responses:
 *       200: { description: Gio hang sau khi cap nhat }
 */
router.put("/update", validate(updateCartSchema), orderController.updateCartItem);

/**
 * @swagger
 * /cart/merge:
 *   post:
 *     tags: [Cart]
 *     summary: Gop gio hang khach vang (localStorage) vao gio hang tren server
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId: { type: string }
 *                     variantSku: { type: string }
 *                     quantity: { type: integer }
 *     responses:
 *       200: { description: Gio hang sau khi gop }
 */
router.post("/merge", validate(mergeCartSchema), orderController.mergeCart);

/**
 * @swagger
 * /cart/remove/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Xoa mot dong khoi gio hang
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Gio hang sau khi xoa }
 */
router.delete("/remove/:itemId", orderController.removeCartItem);

/**
 * @swagger
 * /cart/clear:
 *   delete:
 *     tags: [Cart]
 *     summary: Xoa toan bo gio hang
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Gio hang rong }
 */
router.delete("/clear", orderController.clearCart);

export default router;
