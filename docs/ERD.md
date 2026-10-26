# Sơ đồ quan hệ dữ liệu (ERD)

```mermaid
erDiagram
    USER ||--o{ ORDER      : "đặt"
    USER ||--o| CART       : "sở hữu"
    USER ||--o{ REVIEW     : "viết"
    USER }o--o{ PRODUCT    : "yêu thích (wishlist)"

    CATEGORY ||--o{ PRODUCT  : "chứa"
    CATEGORY ||--o{ CATEGORY : "danh mục con"

    PRODUCT ||--o{ REVIEW     : "được đánh giá"
    PRODUCT ||--o{ CART_ITEM  : "nằm trong"
    PRODUCT ||--o{ ORDER_ITEM : "được mua"

    CART   ||--o{ CART_ITEM  : "gồm"
    ORDER  ||--o{ ORDER_ITEM : "gồm"
    COUPON ||--o{ ORDER      : "áp dụng cho"

    USER {
        ObjectId _id
        string   name
        string   email UK
        string   password "bcrypt, select:false"
        string   role "customer | staff | admin"
        array    addresses "subdocument"
        array    wishlist "ref Product"
        bool     isBlocked
        string   refreshToken "SHA-256, select:false"
    }

    CATEGORY {
        ObjectId _id
        string   name
        string   slug UK
        ObjectId parentCategory FK "tự tham chiếu"
        int      position
        bool     isActive
    }

    PRODUCT {
        ObjectId _id
        string   name
        string   slug UK
        ObjectId category FK
        array    images
        array    hairType
        string   holdLevel "low|medium|high|extreme"
        string   finish "matte|shiny|natural"
        array    variants "name, price, salePrice, stock, sku"
        float    ratingsAverage "tính từ review đã duyệt"
        int      numReviews
        int      soldCount
        array    tags
        bool     isActive
    }

    CART {
        ObjectId _id
        ObjectId user FK UK
        array    items
    }

    CART_ITEM {
        ObjectId product FK
        string   variantSku
        int      quantity
        int      priceAtAdd "để phát hiện giá đã đổi"
    }

    ORDER {
        ObjectId _id
        string   orderCode UK "MRS + ngày + random"
        ObjectId user FK
        object   shippingAddress "snapshot, không tham chiếu"
        string   paymentMethod "cod|vnpay|momo|stripe"
        string   paymentStatus "pending|paid|failed|refunded"
        string   orderStatus "7 trạng thái"
        array    statusHistory "status, note, updatedBy, updatedAt"
        int      subtotal
        int      shippingFee
        int      discount
        int      total
        ObjectId coupon FK
    }

    ORDER_ITEM {
        ObjectId product FK
        string   name "snapshot tại thời điểm mua"
        string   image
        string   variantSku
        int      price
        int      quantity
    }

    REVIEW {
        ObjectId _id
        ObjectId product FK
        ObjectId user FK
        int      rating "1-5"
        string   comment
        array    images
        bool     isApproved "mặc định false"
        string   adminReply
    }

    COUPON {
        ObjectId _id
        string   code UK
        string   type "percent | fixed"
        int      value
        int      minOrderValue
        int      maxDiscount "0 = không giới hạn"
        int      usageLimit
        int      usedCount
        int      perUserLimit
        array    usedBy "user, count"
        date     expiresAt
        bool     isActive
    }

    BANNER {
        ObjectId _id
        string   type "hero_video|hero_image|collection_banner|promo|story"
        string   title
        string   subtitle
        string   mediaUrl
        string   posterUrl
        string   linkUrl
        int      position
        bool     isActive
    }
```

## Index

| Collection | Index | Mục đích |
|---|---|---|
| `users` | `email` (unique), `role` | Đăng nhập, lọc theo vai trò |
| `categories` | `slug` (unique) | Tra cứu theo URL |
| `products` | `slug` (unique) | Tra cứu theo URL |
| `products` | text `{name, tags, shortDescription, brand}` có trọng số | Tìm kiếm |
| `products` | `category`, `holdLevel`, `tags`, `isActive` | Lọc |
| `products` | `createdAt: -1`, `soldCount: -1` | Sắp xếp mới nhất / bán chạy |
| `orders` | `orderCode` (unique), `user`, `orderStatus`, `paymentStatus`, `createdAt: -1` | Tra cứu & lọc |
| `carts` | `user` (unique) | Mỗi khách một giỏ |
| `reviews` | `{product, user}` (unique), `isApproved` | Chặn đánh giá trùng, lọc duyệt |
| `coupons` | `code` (unique) | Áp mã |

## Ghi chú thiết kế

**Snapshot trong đơn hàng.** `ORDER_ITEM` lưu bản sao `name`, `image`, `price` thay vì chỉ
tham chiếu `Product`. Đổi tên hay đổi giá sản phẩm sau này không làm sai lệch hoá đơn đã phát
hành. `shippingAddress` cũng là snapshot vì lý do tương tự.

**Tồn kho theo variant.** Số lượng nằm ở từng phần tử `variants[]`, không ở cấp sản phẩm.
Việc trừ kho dùng cập nhật có điều kiện nguyên tử:

```js
Product.updateOne(
  { _id, variants: { $elemMatch: { sku, stock: { $gte: qty } } } },
  { $inc: { "variants.$.stock": -qty, soldCount: qty } },
);
```

Nếu `modifiedCount === 0` nghĩa là hàng vừa hết — service rollback các mặt hàng đã trừ trước
đó rồi báo lỗi. Cách này an toàn cả khi MongoDB chạy standalone (không có replica set nên
không dùng được transaction).

**Điểm đánh giá.** `ratingsAverage` và `numReviews` là giá trị phi chuẩn hoá, được tính lại
bằng `Review.recalcProductRating()` sau mỗi lần lưu/duyệt/xoá review, và **chỉ tính review đã
duyệt**.

**Trạng thái đơn hàng.** Luồng chuyển hợp lệ khai báo trong `STATUS_FLOW`
(`server/src/models/Order.js`) và được kiểm tra ở service — không thể nhảy cóc từ
`pending` thẳng sang `delivered`.

```
pending ──► confirmed ──► processing ──► shipping ──► delivered ──► returned
   │            │             │              │
   └────────────┴─────────────┴──────────────┴──► cancelled
```
