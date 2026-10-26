import swaggerJsdoc from "swagger-jsdoc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../config/env.js";
import { schemas } from "./schemas/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Morris Hair Wax Shop API",
      version: "1.0.0",
      description: [
        "API cho website thương mại điện tử bán sáp vuốt tóc nam.",
        "",
        "**Cách test API có phân quyền:**",
        "1. Gọi `POST /auth/login` với tài khoản seed (admin@morrisshop.vn / admin123).",
        "2. Copy `data.accessToken` trong response.",
        "3. Bấm nút **Authorize** ở góc trên bên phải, dán token vào (không cần thêm chữ Bearer).",
        "4. Các endpoint có biểu tượng ổ khoá giờ đã gọi được.",
        "",
        "Refresh token được lưu trong httpOnly cookie nên `POST /auth/refresh-token` chỉ hoạt động khi trình duyệt giữ cookie.",
      ].join("\n"),
      contact: { name: "Morris Grooming Co." },
      license: { name: "MIT" },
    },
    servers: [
      { url: `http://localhost:${env.port}/api`, description: "Local dev" },
      { url: "https://api.yourdomain.com/api", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas,
      responses: {
        Unauthorized: {
          description: "Chưa đăng nhập hoặc token hết hạn",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        Forbidden: {
          description: "Không đủ quyền",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        NotFound: {
          description: "Không tìm thấy tài nguyên",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
        ValidationError: {
          description: "Dữ liệu đầu vào không hợp lệ",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "System", description: "Health check" },
      { name: "Auth", description: "Đăng ký, đăng nhập, JWT, quên mật khẩu" },
      { name: "Users", description: "Hồ sơ, địa chỉ, wishlist, quản lý người dùng" },
      { name: "Categories", description: "Danh mục sản phẩm" },
      { name: "Products", description: "Sản phẩm, tìm kiếm, lọc, tồn kho" },
      { name: "Reviews", description: "Đánh giá sản phẩm" },
      { name: "Cart", description: "Giỏ hàng" },
      { name: "Orders", description: "Đặt hàng, trạng thái, thanh toán" },
      { name: "Coupons", description: "Mã giảm giá" },
      { name: "Banners", description: "Nội dung trang chủ" },
      { name: "Dashboard", description: "Thống kê admin" },
      { name: "Upload", description: "Tải ảnh lên Cloudinary" },
    ],
  },
  // glob cua swagger-jsdoc chi hieu dau gach cheo xuoi, ke ca tren Windows
  apis: [path.resolve(__dirname, "../routes").replace(/\\/g, "/") + "/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions = {
  customSiteTitle: "Morris Shop API Docs",
  swaggerOptions: { persistAuthorization: true, docExpansion: "none", filter: true, tagsSorter: "alpha" },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { font-family: Georgia, serif; font-weight: 400 }
  `,
};

export default swaggerSpec;
