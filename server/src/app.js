import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import swaggerUi from "swagger-ui-express";
import path from "node:path";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { swaggerSpec, swaggerUiOptions } from "./docs/swaggerConfig.js";
import logger from "./utils/logger.js";

const app = express();

app.set("trust proxy", 1);

/* --------------------------- Bao mat & parser --------------------------- */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Swagger UI can inline style
  }),
);

const allowedOrigins = [env.clientUrl, "http://localhost:5173", "http://localhost:3000"];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      // O moi truong dev, cho phep moi port localhost (5173, 5174, 5175...)
      if (!env.isProd && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        return cb(null, true);
      }
      return cb(new Error(`CORS: origin ${origin} khong duoc phep`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(compression());
app.use(mongoSanitize({ allowDots: true, replaceWith: "_" }));

if (!env.isProd) {
  app.use(morgan("dev", { stream: { write: (msg) => logger.http?.(msg.trim()) || logger.debug(msg.trim()) } }));
}

/* ------------------------------ Static files ---------------------------- */
// Fallback khi chua cau hinh Cloudinary
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

/* -------------------------------- Swagger ------------------------------- */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

/* --------------------------------- Routes -------------------------------- */
app.get("/", (_req, res) =>
  res.json({
    name: "Morris Hair Wax Shop API",
    version: "1.0.0",
    docs: `http://localhost:${env.port}/api-docs`,
    health: "/api/health",
  }),
);

app.use("/api", apiLimiter, routes);

/* ---------------------------- Xu ly loi chung ---------------------------- */
app.use(notFound);
app.use(errorHandler);

export default app;
