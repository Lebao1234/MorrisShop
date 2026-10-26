/**
 * Schema tai su dung cho OpenAPI (components.schemas).
 * Tach rieng de khong phai lap lai dinh nghia trong tung file route.
 */

const objectId = { type: "string", example: "665f1c2a9b1e4a0012ab34cd" };

export const Address = {
  type: "object",
  required: ["fullName", "phone", "province", "district", "ward", "street"],
  properties: {
    _id: objectId,
    fullName: { type: "string", example: "Nguyễn Văn A" },
    phone: { type: "string", example: "0912345678" },
    province: { type: "string", example: "Hà Nội" },
    district: { type: "string", example: "Cầu Giấy" },
    ward: { type: "string", example: "Dịch Vọng" },
    street: { type: "string", example: "Số 12 ngõ 5 Trần Thái Tông" },
    isDefault: { type: "boolean" },
  },
};

export const User = {
  type: "object",
  properties: {
    _id: objectId,
    name: { type: "string", example: "Nguyễn Văn A" },
    email: { type: "string", format: "email" },
    phone: { type: "string" },
    avatar: { type: "string" },
    role: { type: "string", enum: ["customer", "staff", "admin"] },
    addresses: { type: "array", items: Address },
    wishlist: { type: "array", items: objectId },
    isVerified: { type: "boolean" },
    isBlocked: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
  },
};

export const Variant = {
  type: "object",
  required: ["name", "price"],
  properties: {
    _id: objectId,
    name: { type: "string", example: "80g" },
    price: { type: "number", example: 390000 },
    salePrice: { type: "number", example: 350000 },
    stock: { type: "integer", example: 40 },
    sku: { type: "string", example: "IRON-CLAY-80G" },
  },
};

export const Category = {
  type: "object",
  properties: {
    _id: objectId,
    name: { type: "string", example: "Sáp vuốt tóc" },
    slug: { type: "string", example: "sap-vuot-toc" },
    description: { type: "string" },
    image: { type: "string" },
    parentCategory: { ...objectId, nullable: true },
    position: { type: "integer" },
    isActive: { type: "boolean" },
  },
};

export const CategoryInput = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", example: "Sáp vuốt tóc" },
    slug: { type: "string" },
    description: { type: "string" },
    image: { type: "string" },
    parentCategory: { type: "string", nullable: true },
    position: { type: "integer" },
    isActive: { type: "boolean" },
  },
};

export const Product = {
  type: "object",
  properties: {
    _id: objectId,
    name: { type: "string", example: "Iron Clay Matte Wax" },
    slug: { type: "string", example: "iron-clay-matte-wax" },
    category: { oneOf: [objectId, Category] },
    brand: { type: "string", example: "Morris" },
    description: { type: "string" },
    shortDescription: { type: "string" },
    images: { type: "array", items: { type: "string" } },
    hairType: { type: "array", items: { type: "string" }, example: ["tóc thẳng", "tóc dày"] },
    holdLevel: { type: "string", enum: ["low", "medium", "high", "extreme"] },
    finish: { type: "string", enum: ["matte", "shiny", "natural"] },
    variants: { type: "array", items: Variant },
    ingredients: { type: "string" },
    howToUse: { type: "string" },
    ratingsAverage: { type: "number", example: 4.7 },
    numReviews: { type: "integer", example: 23 },
    soldCount: { type: "integer", example: 154 },
    tags: { type: "array", items: { type: "string" }, example: ["bestseller", "new"] },
    isActive: { type: "boolean" },
    minPrice: { type: "number", readOnly: true },
    totalStock: { type: "integer", readOnly: true },
  },
};

export const ProductInput = {
  type: "object",
  required: ["name", "category", "images", "variants"],
  properties: {
    name: { type: "string", example: "Iron Clay Matte Wax" },
    category: { type: "string", example: "665f1c2a9b1e4a0012ab34cd" },
    brand: { type: "string" },
    description: { type: "string" },
    shortDescription: { type: "string" },
    images: { type: "array", items: { type: "string" }, minItems: 1 },
    hairType: { type: "array", items: { type: "string" } },
    holdLevel: { type: "string", enum: ["low", "medium", "high", "extreme"] },
    finish: { type: "string", enum: ["matte", "shiny", "natural"] },
    variants: { type: "array", items: Variant, minItems: 1 },
    ingredients: { type: "string" },
    howToUse: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    isActive: { type: "boolean" },
  },
};

export const CartItem = {
  type: "object",
  properties: {
    _id: objectId,
    product: {
      type: "object",
      properties: { _id: objectId, name: { type: "string" }, slug: { type: "string" }, image: { type: "string" } },
    },
    variantSku: { type: "string" },
    variantName: { type: "string" },
    price: { type: "number" },
    quantity: { type: "integer" },
    stock: { type: "integer" },
    lineTotal: { type: "number" },
    outOfStock: { type: "boolean" },
    priceChanged: { type: "boolean" },
  },
};

export const Cart = {
  type: "object",
  properties: {
    _id: objectId,
    items: { type: "array", items: CartItem },
    subtotal: { type: "number" },
    totalQuantity: { type: "integer" },
  },
};

export const Order = {
  type: "object",
  properties: {
    _id: objectId,
    orderCode: { type: "string", example: "MRS20250908ABCDE" },
    user: { oneOf: [objectId, User] },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product: objectId,
          name: { type: "string" },
          image: { type: "string" },
          variantSku: { type: "string" },
          variantName: { type: "string" },
          price: { type: "number" },
          quantity: { type: "integer" },
        },
      },
    },
    shippingAddress: Address,
    paymentMethod: { type: "string", enum: ["cod", "vnpay", "momo", "stripe"] },
    paymentStatus: { type: "string", enum: ["pending", "paid", "failed", "refunded"] },
    orderStatus: {
      type: "string",
      enum: ["pending", "confirmed", "processing", "shipping", "delivered", "cancelled", "returned"],
    },
    statusHistory: {
      type: "array",
      items: {
        type: "object",
        properties: {
          status: { type: "string" },
          note: { type: "string" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
    subtotal: { type: "number" },
    shippingFee: { type: "number" },
    discount: { type: "number" },
    total: { type: "number" },
    couponCode: { type: "string", nullable: true },
    note: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
};

export const OrderInput = {
  type: "object",
  required: ["shippingAddress"],
  properties: {
    shippingAddress: {
      type: "object",
      required: ["fullName", "phone", "province", "district", "ward", "street"],
      properties: {
        fullName: { type: "string", example: "Nguyễn Văn A" },
        phone: { type: "string", example: "0912345678" },
        province: { type: "string", example: "Hà Nội" },
        district: { type: "string", example: "Cầu Giấy" },
        ward: { type: "string", example: "Dịch Vọng" },
        street: { type: "string", example: "Số 12 ngõ 5 Trần Thái Tông" },
      },
    },
    paymentMethod: { type: "string", enum: ["cod", "vnpay", "momo", "stripe"], default: "cod" },
    couponCode: { type: "string", example: "MORRIS10" },
    note: { type: "string" },
  },
};

export const Coupon = {
  type: "object",
  properties: {
    _id: objectId,
    code: { type: "string", example: "MORRIS10" },
    description: { type: "string" },
    type: { type: "string", enum: ["percent", "fixed"] },
    value: { type: "number", example: 10 },
    minOrderValue: { type: "number" },
    maxDiscount: { type: "number" },
    usageLimit: { type: "integer" },
    usedCount: { type: "integer" },
    expiresAt: { type: "string", format: "date-time" },
    isActive: { type: "boolean" },
  },
};

export const CouponInput = {
  type: "object",
  required: ["code", "type", "value", "expiresAt"],
  properties: {
    code: { type: "string", example: "MORRIS10" },
    description: { type: "string" },
    type: { type: "string", enum: ["percent", "fixed"] },
    value: { type: "number", example: 10 },
    minOrderValue: { type: "number", example: 300000 },
    maxDiscount: { type: "number", example: 100000 },
    usageLimit: { type: "integer", example: 100 },
    perUserLimit: { type: "integer", example: 1 },
    startsAt: { type: "string", format: "date-time" },
    expiresAt: { type: "string", format: "date-time" },
    isActive: { type: "boolean" },
  },
};

export const Review = {
  type: "object",
  properties: {
    _id: objectId,
    product: { oneOf: [objectId, Product] },
    user: { oneOf: [objectId, User] },
    rating: { type: "integer", minimum: 1, maximum: 5 },
    comment: { type: "string" },
    images: { type: "array", items: { type: "string" } },
    isApproved: { type: "boolean" },
    adminReply: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
};

export const Banner = {
  type: "object",
  properties: {
    _id: objectId,
    type: { type: "string", enum: ["hero_video", "hero_image", "collection_banner", "promo", "story"] },
    title: { type: "string" },
    subtitle: { type: "string" },
    eyebrow: { type: "string" },
    ctaLabel: { type: "string" },
    mediaUrl: { type: "string" },
    posterUrl: { type: "string" },
    linkUrl: { type: "string" },
    position: { type: "integer" },
    isActive: { type: "boolean" },
  },
};

export const RegisterInput = {
  type: "object",
  required: ["name", "email", "password"],
  properties: {
    name: { type: "string", example: "Nguyễn Văn A" },
    email: { type: "string", format: "email", example: "customer@morrisshop.vn" },
    password: { type: "string", minLength: 6, example: "customer123" },
    phone: { type: "string", example: "0912345678" },
  },
};

export const LoginInput = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: { type: "string", format: "email", example: "admin@morrisshop.vn" },
    password: { type: "string", example: "admin123" },
  },
};

export const AuthResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    data: {
      type: "object",
      properties: {
        user: User,
        accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
      },
    },
  },
};

export const SuccessResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: "Thành công" },
    data: { type: "object" },
  },
};

export const PaginatedResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string" },
    data: { type: "array", items: { type: "object" } },
    meta: {
      type: "object",
      properties: {
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 12 },
        total: { type: "integer", example: 48 },
        totalPages: { type: "integer", example: 4 },
        hasNext: { type: "boolean" },
      },
    },
  },
};

export const ErrorResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Dữ liệu không hợp lệ" },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: { field: { type: "string" }, message: { type: "string" } },
      },
    },
  },
};

export const schemas = {
  Address,
  User,
  Variant,
  Category,
  CategoryInput,
  Product,
  ProductInput,
  CartItem,
  Cart,
  Order,
  OrderInput,
  Coupon,
  CouponInput,
  Review,
  Banner,
  RegisterInput,
  LoginInput,
  AuthResponse,
  SuccessResponse,
  PaginatedResponse,
  ErrorResponse,
};

export default schemas;
