import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const num = (v, fallback) => (v === undefined || v === "" ? fallback : Number(v));

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  port: num(process.env.PORT, 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/morris_shop",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
    refreshCookieMaxAge: 7 * 24 * 60 * 60 * 1000,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    get enabled() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },

  mail: {
    host: process.env.EMAIL_HOST,
    port: num(process.env.EMAIL_PORT, 587),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || "Morris Shop <no-reply@morrisshop.vn>",
    get enabled() {
      return Boolean(this.host && this.user && this.pass);
    },
  },

  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    url: process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: process.env.VNPAY_RETURN_URL || "http://localhost:5173/checkout/vnpay-return",
    get enabled() {
      return Boolean(this.tmnCode && this.hashSecret);
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    get enabled() {
      return Boolean(this.secretKey);
    },
  },

  shipping: {
    fee: num(process.env.SHIPPING_FEE, 30000),
    freeThreshold: num(process.env.FREE_SHIPPING_THRESHOLD, 500000),
  },

  lowStockThreshold: num(process.env.LOW_STOCK_THRESHOLD, 5),
};

export default env;
