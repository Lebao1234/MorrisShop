import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { writeLimiter } from "../middlewares/rateLimiter.js";
import {
  createOrderSchema,
  previewOrderSchema,
  updateStatusSchema,
  cancelOrderSchema,
  listOrderQuery,
} from "../validators/order.validator.js";

const router = Router();

/* ---------------- Webhook / callback: khong yeu cau dang nhap ---------------- */

/**
 * @swagger
 * /orders/payment/vnpay-return:
 *   get:
 *     tags: [Orders]
 *     summary: Xac thuc ket qua thanh toan VNPay (client goi sau khi duoc redirect ve)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema: { type: string }
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema: { type: string }
 *       - in: query
 *         name: vnp_SecureHash
 *         schema: { type: string }
 *     responses:
 *       200: { description: "{ success, order }" }
 *       400: { description: Chu ky khong hop le }
 */
router.get("/payment/vnpay-return", orderController.vnpayReturn);

/**
 * @swagger
 * /orders/payment/vnpay-ipn:
 *   get:
 *     tags: [Orders]
 *     summary: IPN endpoint cho VNPay goi server-to-server
 *     security: []
 *     responses:
 *       200: { description: "{ RspCode, Message }" }
 */
router.get("/payment/vnpay-ipn", orderController.vnpayIpn);

/**
 * @swagger
 * /orders/payment/stripe-webhook:
 *   post:
 *     tags: [Orders]
 *     summary: Webhook Stripe (checkout.session.completed)
 *     security: []
 *     responses:
 *       200: { description: Da xu ly }
 */
router.post("/payment/stripe-webhook", orderController.stripeWebhook);

/* ------------------------------ Khach hang ------------------------------ */

router.use(protect);

/**
 * @swagger
 * /orders/preview:
 *   post:
 *     tags: [Orders]
 *     summary: Xem truoc tong tien don hang (phi ship, ma giam gia) truoc khi dat
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               couponCode: { type: string }
 *     responses:
 *       200: { description: "{ subtotal, shippingFee, discount, total, amountToFreeShipping }" }
 */
router.post("/preview", validate(previewOrderSchema), orderController.previewOrder);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     tags: [Orders]
 *     summary: Lich su don hang cua toi
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipping, delivered, cancelled, returned]
 *     responses:
 *       200:
 *         description: Danh sach don hang
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items: { $ref: '#/components/schemas/Order' }
 */
router.get("/my-orders", orderController.getMyOrders);

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Tao don hang tu gio hang (tinh lai gia o server)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderInput' }
 *     responses:
 *       201:
 *         description: "Đặt hàng thành công. payment.redirectUrl khac null neu can chuyen sang cong thanh toan"
 *       400: { description: Gio hang trong hoac khong du ton kho }
 *   get:
 *     tags: [Orders]
 *     summary: Danh sach tat ca don hang (admin/staff)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         description: Tim theo ma don hang
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Danh sach don hang co phan trang }
 *       403: { description: Khong du quyen }
 */
router
  .route("/")
  .post(writeLimiter, validate(createOrderSchema), orderController.createOrder)
  .get(authorize("admin", "staff"), validate(listOrderQuery), orderController.listOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Chi tiet don hang (theo ID hoac orderCode)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ObjectId hoac orderCode (VD MRS20250101ABCDE)
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Chi tiet don hang
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/Order' }
 *       403: { description: Khong phai don cua ban }
 *       404: { description: Không tìm thấy đơn hàng }
 */
router.get("/:id", orderController.getOrderDetail);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Huy don hang (khach chi huy duoc khi don dang pending)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200: { description: Đã huỷ don, ton kho duoc hoan lai }
 *       400: { description: Trang thai don khong cho phep huy }
 */
router.put("/:id/cancel", validate(cancelOrderSchema), orderController.cancelOrder);

/**
 * @swagger
 * /orders/{id}/retry-payment:
 *   post:
 *     tags: [Orders]
 *     summary: Tao lai link thanh toan cho don chua thanh toan
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               method: { type: string, enum: [vnpay, stripe, momo] }
 *     responses:
 *       200: { description: "{ type, redirectUrl }" }
 */
router.post("/:id/retry-payment", orderController.retryPayment);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Cap nhat trang thai don hang (admin/staff) - kiem tra luong chuyen hop le va gui email
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipping, delivered, cancelled, returned]
 *               note: { type: string }
 *     responses:
 *       200: { description: Da cap nhat trang thai }
 *       400: { description: Buoc chuyen trang thai khong hop le }
 */
router.put(
  "/:id/status",
  authorize("admin", "staff"),
  validate(updateStatusSchema),
  orderController.updateOrderStatus,
);

export default router;
