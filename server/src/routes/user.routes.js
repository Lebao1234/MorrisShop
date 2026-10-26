import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParam, objectId } from "../validators/common.validator.js";
import { z } from "zod";
import {
  updateProfileSchema,
  adminUpdateUserSchema,
  blockUserSchema,
  addAddressSchema,
  updateAddressSchema,
} from "../validators/user.validator.js";

const router = Router();
router.use(protect);

/* ------------------------------ Ho so ca nhan ----------------------------- */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     tags: [Users]
 *     summary: Cap nhat ho so cua chinh minh
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string, example: "0912345678" }
 *               avatar: { type: string }
 *     responses:
 *       200: { description: Đã cập nhật hồ sơ }
 */
router.put("/profile", validate(updateProfileSchema), userController.updateProfile);

/* -------------------------------- Dia chi -------------------------------- */

/**
 * @swagger
 * /users/addresses:
 *   get:
 *     tags: [Users]
 *     summary: Danh sach dia chi cua toi
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sach dia chi }
 *   post:
 *     tags: [Users]
 *     summary: Them dia chi giao hang
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Address' }
 *     responses:
 *       201: { description: Đã thêm địa chỉ }
 */
router
  .route("/addresses")
  .get(userController.getAddresses)
  .post(validate(addAddressSchema), userController.addAddress);

/**
 * @swagger
 * /users/addresses/{addressId}:
 *   put:
 *     tags: [Users]
 *     summary: Cap nhat dia chi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Address' }
 *     responses:
 *       200: { description: Đã cập nhật địa chỉ }
 *   delete:
 *     tags: [Users]
 *     summary: Xoa dia chi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Đã xoá địa chỉ }
 */
router
  .route("/addresses/:addressId")
  .put(validate(updateAddressSchema), userController.updateAddress)
  .delete(validate({ params: z.object({ addressId: objectId }) }), userController.deleteAddress);

/* ------------------------------- Wishlist -------------------------------- */

/**
 * @swagger
 * /users/wishlist:
 *   get:
 *     tags: [Users]
 *     summary: Danh sach san pham yeu thich
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sach san pham }
 */
router.get("/wishlist", userController.getWishlist);

/**
 * @swagger
 * /users/wishlist/{productId}:
 *   post:
 *     tags: [Users]
 *     summary: Them/bo san pham khoi danh sach yeu thich (toggle)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: "{ added: boolean }" }
 *   delete:
 *     tags: [Users]
 *     summary: Bo san pham khoi danh sach yeu thich
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Da cap nhat wishlist }
 */
router
  .route("/wishlist/:productId")
  .post(userController.toggleWishlist)
  .delete(userController.toggleWishlist);

/* -------------------------------- Admin ---------------------------------- */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Danh sach nguoi dung (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [customer, staff, admin] }
 *       - in: query
 *         name: isBlocked
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200: { description: Danh sach nguoi dung co phan trang }
 *       403: { description: Khong du quyen }
 */
router.get("/", authorize("admin"), userController.listUsers);

/**
 * @swagger
 * /users/{id}/block:
 *   put:
 *     tags: [Users]
 *     summary: Khoa / mo khoa tai khoan (admin)
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
 *             required: [isBlocked]
 *             properties:
 *               isBlocked: { type: boolean }
 *     responses:
 *       200: { description: Da cap nhat trang thai tai khoan }
 */
router.put("/:id/block", authorize("admin"), validate(blockUserSchema), userController.blockUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Chi tiet nguoi dung (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Thong tin nguoi dung }
 *   put:
 *     tags: [Users]
 *     summary: Cap nhat nguoi dung, phan quyen staff (admin)
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
 *             properties:
 *               name: { type: string }
 *               role: { type: string, enum: [customer, staff, admin] }
 *               isBlocked: { type: boolean }
 *     responses:
 *       200: { description: Da cap nhat }
 *   delete:
 *     tags: [Users]
 *     summary: Xoa nguoi dung (admin)
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
  .get(authorize("admin"), validate({ params: idParam }), userController.getUser)
  .put(authorize("admin"), validate(adminUpdateUserSchema), userController.adminUpdateUser)
  .delete(authorize("admin"), validate({ params: idParam }), userController.deleteUser);

export default router;
