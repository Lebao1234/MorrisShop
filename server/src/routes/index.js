import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import productRoutes from "./product.routes.js";
import reviewRoutes from "./review.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import { couponRouter, bannerRouter, dashboardRouter, uploadRouter } from "./misc.routes.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Kiem tra server song
 *     security: []
 *     responses:
 *       200: { description: "{ status: 'ok' }" }
 */
router.get("/health", (_req, res) =>
  res.json({ success: true, status: "ok", uptime: process.uptime(), timestamp: new Date() }),
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/reviews", reviewRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/coupons", couponRouter);
router.use("/banners", bannerRouter);
router.use("/admin/dashboard", dashboardRouter);
router.use("/upload", uploadRouter);

export default router;
