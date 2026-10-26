# MORRIS — Website TMĐT sáp vuốt tóc nam

Website thương mại điện tử đầy đủ chức năng bán sáp vuốt tóc và sản phẩm chăm sóc tóc nam,
dựng trên **MERN stack** (MongoDB · Express · React · Node.js) với giao diện lấy cảm hứng từ
các thương hiệu grooming cao cấp: hero video tràn viền, typography biên tập, bảng màu trung
tính đen – kem – đồng.

```
┌──────────────┐        REST/JSON        ┌──────────────┐        ┌───────────┐
│   client     │ ──────────────────────► │   server     │ ─────► │  MongoDB  │
│ React + Vite │ ◄────────────────────── │ Express MVC  │        └───────────┘
└──────────────┘   httpOnly refresh      └──────────────┘        ┌───────────┐
                        cookie                   └─────────────► │Cloudinary │
                                                                 └───────────┘
```

---

## 1. Chạy thử trong 5 phút

Yêu cầu: **Node.js ≥ 18** và một trong ba lựa chọn MongoDB bên dưới.

```bash
git clone <repo> morris-shop && cd morris-shop
npm install                 # cài cho cả client và server (npm workspaces)

cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Chọn nguồn MongoDB

| Cách | Lệnh | Ghi chú |
|---|---|---|
| Docker (khuyến nghị) | `npm run db:up` | MongoDB 7 ở cổng 27017, dữ liệu bền vững |
| MongoDB Atlas | sửa `MONGO_URI` trong `server/.env` | Dùng cho staging/production |
| In-memory (không cần cài gì) | `npm run db:memory --workspace server` | Giữ terminal mở; **mất dữ liệu khi tắt** |

### Nạp dữ liệu mẫu và khởi động

```bash
npm run seed      # 4 danh mục, 16 sản phẩm, 6 banner, 3 mã giảm giá, 3 tài khoản
npm run dev       # chạy song song server (:5000) và client (:5173)
```

| Địa chỉ | Nội dung |
|---|---|
| http://localhost:5173 | Cửa hàng |
| http://localhost:5173/admin | Bảng điều khiển quản trị |
| http://localhost:5000/api-docs | Swagger UI — test API ngay trên trình duyệt |
| http://localhost:5000/api-docs.json | OpenAPI spec (import vào Postman/Insomnia) |

### Tài khoản có sẵn sau khi seed

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin@morrisshop.vn` | `admin123` |
| Nhân viên | `staff@morrisshop.vn` | `staff123` |
| Khách hàng | `customer@morrisshop.vn` | `customer123` |

> Trang đăng nhập có sẵn nút điền nhanh ba tài khoản này trong môi trường dev.

---

## 2. Cấu trúc thư mục

```
morris-shop/
├── client/                     # React 18 + Vite + TailwindCSS
│   └── src/
│       ├── components/
│       │   ├── ui/             # Lớp shadcn/ui: button, input, overlay, controls, display
│       │   ├── layout/         # Header (fluid island nav), Footer, CartDrawer, SearchOverlay
│       │   ├── product/        # ProductCard, ProductFilters, ReviewForm
│       │   ├── home/           # HeroVideo, Sections (collection grid, carousel, story)
│       │   ├── checkout/       # CheckoutSteps
│       │   ├── admin/          # AdminTable, ImageUploader
│       │   └── common/         # SEO, Reveal, Pagination, RatingStars, EmptyState
│       ├── pages/              # Trang cửa hàng · account/ · admin/
│       ├── routes/             # Cấu hình router + PrivateRoute / AdminRoute / GuestRoute
│       ├── services/           # axiosClient (auto refresh token) + api.js
│       ├── store/              # Zustand: authStore, cartStore
│       ├── hooks/              # useAuth, useCart, useDebounce, useFilterParams…
│       └── lib/utils.js        # cn(), định dạng tiền/ngày, nhãn tiếng Việt
│
├── server/                     # Express + Mongoose (ESM)
│   └── src/
│       ├── config/             # env, db, cloudinary
│       ├── models/             # 8 schema Mongoose
│       ├── repositories/       # Truy vấn DB thuần, tách khỏi nghiệp vụ
│       ├── services/           # Toàn bộ business logic
│       ├── controllers/        # Nhận request → gọi service → trả response
│       ├── routes/             # Endpoint + JSDoc @swagger
│       ├── middlewares/        # auth/RBAC, validate, errorHandler, rateLimiter, upload
│       ├── validators/         # Schema Zod cho mọi input
│       ├── docs/               # swaggerConfig + components.schemas dùng lại
│       ├── seed/               # Dữ liệu mẫu tiếng Việt
│       └── utils/              # ApiError, response, jwt, helpers, logger
│   ├── tests/                  # Jest + Supertest + mongodb-memory-server
│   └── scripts/memory-db.js    # MongoDB in-memory cho môi trường không có Docker
│
├── docs/                       # ERD, ghi chú API
└── docker-compose.yml          # mongo · redis · server · client
```

**Nguyên tắc kiến trúc.** Controller không chạm Mongoose trực tiếp; nghiệp vụ nằm ở
`services/`, truy vấn phức tạp nằm ở `repositories/`. Nhờ vậy service test được mà không cần
dựng HTTP layer — xem `server/tests/order.test.js`.

---

## 3. Tính năng

### Khách hàng
- Trang chủ: hero video tràn viền, lưới bộ sưu tập bất đối xứng, slider bán chạy, khối câu chuyện
- Lọc sản phẩm theo danh mục, khoảng giá, độ giữ nếp, kết thúc, loại tóc, còn hàng — đồng bộ vào URL
- Tìm kiếm realtime (debounce 300ms) trên MongoDB text index
- Chi tiết sản phẩm: gallery zoom, chọn dung tích, tab Thành phần / Cách dùng / Đánh giá, sản phẩm liên quan
- Giỏ hàng hoạt động cả khi **chưa đăng nhập** (localStorage) và tự gộp lên server khi đăng nhập
- Thanh toán 4 bước: giỏ hàng → giao hàng → thanh toán → hoàn tất, áp mã giảm giá realtime
- Sổ địa chỉ, danh sách yêu thích, lịch sử đơn hàng với dòng thời gian trạng thái
- Chỉ khách **đã nhận hàng** mới viết được đánh giá (chặn ở cả server lẫn UI)

### Quản trị (`/admin`)
- Tổng quan: doanh thu theo ngày, đơn theo trạng thái, top bán chạy, cảnh báo tồn kho (Recharts)
- CRUD sản phẩm nhiều phiên bản + upload ảnh, ẩn/hiện, cập nhật tồn kho
- Quản lý đơn hàng: lọc, xem chi tiết, đổi trạng thái theo luồng hợp lệ + gửi email tự động
- Duyệt đánh giá, quản lý danh mục, mã giảm giá, nội dung trang chủ (hero video/banner)
- Phân quyền nhân viên, khoá/mở tài khoản

---

## 4. Phân quyền (RBAC)

| | `customer` | `staff` | `admin` |
|---|:---:|:---:|:---:|
| Đặt hàng, đánh giá, wishlist | ✅ | ✅ | ✅ |
| Xem & đổi trạng thái mọi đơn | — | ✅ | ✅ |
| Cập nhật tồn kho | — | ✅ | ✅ |
| Duyệt đánh giá | — | ✅ | ✅ |
| CRUD sản phẩm / danh mục / mã giảm giá / banner | — | — | ✅ |
| Quản lý người dùng, phân quyền | — | — | ✅ |

Kiểm tra ở **cả hai phía**: `authorize(...roles)` trên từng route và `AdminRoute` ở frontend.
Frontend guard chỉ để ẩn giao diện — server luôn là nguồn quyết định.

---

## 5. Bảo mật

- Mật khẩu băm bcrypt (12 vòng), không bao giờ trả về client (`select: false` + `toSafeJSON()`)
- Access token JWT 15 phút giữ **trong bộ nhớ** (không vào localStorage → giảm bề mặt XSS)
- Refresh token 7 ngày trong **httpOnly cookie**, băm SHA-256 trước khi lưu DB, **xoay vòng mỗi lần dùng**
  (mỗi token mang một `jti` ngẫu nhiên nên token cũ mất hiệu lực ngay)
- Validate + sanitize toàn bộ input bằng Zod; `express-mongo-sanitize` chặn NoSQL injection
- `helmet`, CORS whitelist theo domain, `express-rate-limit` riêng cho auth (10 lần/15 phút)
- Giá tiền **luôn tính lại ở server** từ giỏ hàng — giá client gửi lên bị bỏ qua hoàn toàn
- Trừ tồn kho bằng câu lệnh cập nhật có điều kiện (`$elemMatch` + `stock >= qty`), rollback nếu một mặt hàng thất bại

---

## 6. Kiểm thử

```bash
npm test                       # 51 test: authService, orderService, RBAC, giỏ hàng
npm run test:watch --workspace server
```

Bộ test dùng `mongodb-memory-server` nên **không cần MongoDB đang chạy**. Bao phủ:

| Nhóm | Nội dung |
|---|---|
| `auth.test.js` | Băm mật khẩu, chặn email trùng, khoá tài khoản, xoay vòng refresh token, đổi mật khẩu, httpOnly cookie |
| `order.test.js` | Công thức tổng tiền, ngưỡng miễn phí ship, mã giảm giá (%, cố định, trần giảm, giới hạn lượt), trừ & hoàn tồn kho, luồng trạng thái, `markPayment` idempotent, quyền xem đơn |
| `rbac.test.js` | `authorize()` ở mức unit + phân quyền qua HTTP, chặn đánh giá khi chưa mua, kiểm tra tồn kho khi thêm giỏ |

---

## 7. Tài liệu API

Swagger UI tại **http://localhost:5000/api-docs** — 59 endpoint, có nút **Authorize** để test
API cần đăng nhập:

1. Gọi `POST /auth/login` với `admin@morrisshop.vn` / `admin123`
2. Copy `data.accessToken` trong response
3. Bấm **Authorize** góc trên bên phải, dán token (không cần thêm chữ `Bearer`)

Nhóm endpoint: `Auth · Users · Categories · Products · Reviews · Cart · Orders · Coupons ·
Banners · Dashboard · Upload`.

Tải `http://localhost:5000/api-docs.json` rồi **Import** vào Postman/Insomnia nếu cần test nâng cao.

---

## 8. Biến môi trường

`server/.env` — xem đầy đủ trong [`server/.env.example`](server/.env.example):

| Biến | Bắt buộc | Mặc định / ghi chú |
|---|:---:|---|
| `PORT` | | `5000` |
| `MONGO_URI` | ✅ | `mongodb://127.0.0.1:27017/morris_shop` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | ✅ | **Đổi trước khi lên production** |
| `CLIENT_URL` | ✅ | Dùng cho CORS và link trong email |
| `CLOUDINARY_*` | | Bỏ trống → ảnh lưu vào `server/uploads/` |
| `EMAIL_*` | | Bỏ trống → email chỉ ghi ra console |
| `VNPAY_*`, `STRIPE_SECRET_KEY` | | Bỏ trống → chỉ dùng được COD |
| `SHIPPING_FEE`, `FREE_SHIPPING_THRESHOLD` | | `30000` / `500000` |

`client/.env`: `VITE_API_BASE_URL=http://localhost:5000/api`

**Dịch vụ ngoài đều tuỳ chọn.** Chưa cấu hình Cloudinary/SMTP/cổng thanh toán thì hệ thống
vẫn chạy đủ luồng đặt hàng bằng COD, ảnh lưu local và email in ra console.

---

## 9. Thanh toán

| Phương thức | Trạng thái | Cần cấu hình |
|---|---|---|
| COD | Hoạt động đầy đủ | — |
| VNPay | Hoạt động (sandbox) | `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET` |
| Stripe | Hoạt động | `STRIPE_SECRET_KEY` + `npm i stripe` |
| MoMo | Chưa triển khai | — |

VNPay có cả URL redirect (`/orders/payment/vnpay-return`) và IPN server-to-server
(`/orders/payment/vnpay-ipn`); chữ ký HMAC-SHA512 được xác thực ở cả hai. `markPayment` là
idempotent nên IPN gọi lại nhiều lần cũng không ghi đè đơn đã thanh toán.

---

## 10. Thiết kế

Giao diện tuân thủ Agent Skill [`high-end-visual-design`](.agents/skills/high-end-visual-design/SKILL.md)
đã cài ở Phase 0:

- **Vibe:** *Editorial Luxury* — nền kem `#F7F5F0`, mực `#0B0B0B`, nhấn đồng `#B08D57`, phủ film-grain cố định
- **Layout:** *Editorial Split* cho hero/story, lưới bento bất đối xứng cho bộ sưu tập
- **Typography:** Playfair Display (tiêu đề) + Plus Jakarta Sans (nội dung) — tránh font mặc định bị cấm
- **Icon:** Phosphor Light (nét mảnh) thay cho icon nét dày
- **Kiến trúc thẻ:** Double-bezel — vỏ ngoài `rounded-bezel` + lõi trong bán kính đồng tâm
- **CTA:** nút viên nén với icon lồng trong vòng tròn riêng, trượt chéo khi hover
- **Chuyển động:** `cubic-bezier(0.32, 0.72, 0, 1)`, fade-up + gỡ blur khi vào khung nhìn, tôn trọng `prefers-reduced-motion`

Toàn bộ token màu, thang chữ, bóng và easing khai báo trong
[`client/tailwind.config.js`](client/tailwind.config.js). Các thang tuỳ chỉnh được đăng ký với
`tailwind-merge` trong `lib/utils.js` để `cn()` không nuốt mất class.

---

## 11. Triển khai

```bash
npm run build                  # build client → client/dist
docker compose --profile full up --build   # chạy toàn bộ stack bằng Docker
```

| Thành phần | Nền tảng gợi ý |
|---|---|
| `client` | Vercel / Netlify — build `npm run build`, output `client/dist` |
| `server` | Render / Railway — start `node src/server.js` |
| Database | MongoDB Atlas |
| Ảnh | Cloudinary |

Lưu ý khi lên production: đặt `NODE_ENV=production` (cookie chuyển sang `secure` + `SameSite=None`),
thêm domain thật vào whitelist CORS trong `server/src/app.js`, và đổi toàn bộ secret JWT.
