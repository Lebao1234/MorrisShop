import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../config/db.js";
import { User, Category, Product, Coupon, Banner, Review, Order, Cart } from "../models/index.js";
import { toSlug, genSku } from "../utils/helpers.js";
import logger from "../utils/logger.js";
import { categories, products, banners, coupons, users, sampleReviews } from "./data.js";

const destroy = async () => {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
    Review.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
  ]);
  logger.info("Đã xoá toàn bộ dữ liệu");
};

const seed = async () => {
  await destroy();

  /* ------------------------------- Users -------------------------------- */
  // Dung create() de pre-save hook hash mat khau
  const createdUsers = [];
  for (const u of users) createdUsers.push(await User.create(u));
  const admin = createdUsers.find((u) => u.role === "admin");
  const customer = createdUsers.find((u) => u.role === "customer");
  logger.info(`Đã tạo ${createdUsers.length} tài khoản`);

  /* ----------------------------- Categories ----------------------------- */
  const categoryMap = {};
  for (const c of categories) {
    const { key, ...data } = c;
    const doc = await Category.create(data);
    categoryMap[key] = doc;
  }
  logger.info(`Đã tạo ${Object.keys(categoryMap).length} danh mục`);

  /* ------------------------------ Products ------------------------------ */
  const createdProducts = [];
  for (const p of products) {
    const { categoryKey, variants, ...rest } = p;
    const doc = await Product.create({
      ...rest,
      slug: toSlug(p.name),
      category: categoryMap[categoryKey]._id,
      brand: "Morris",
      variants: variants.map((v) => ({ ...v, sku: genSku(p.name, v.name) })),
      isActive: true,
    });
    createdProducts.push(doc);
  }
  logger.info(`Đã tạo ${createdProducts.length} sản phẩm`);

  /* ------------------------------ Banners ------------------------------- */
  await Banner.insertMany(banners.map((b) => ({ ...b, isActive: true })));
  logger.info(`Đã tạo ${banners.length} banner`);

  /* ------------------------------ Coupons ------------------------------- */
  await Coupon.insertMany(coupons.map((c) => ({ ...c, isActive: true, usedCount: 0 })));
  logger.info(`Đã tạo ${coupons.length} mã giảm giá`);

  /* -------------------- Don hang mau + danh gia mau --------------------- */
  // Tao 1 don da giao de khach hang mau co the danh gia san pham
  const orderItems = createdProducts.slice(0, 3).map((p) => {
    const variant = p.variants[0];
    const price = variant.salePrice > 0 ? variant.salePrice : variant.price;
    return {
      product: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images[0],
      variantSku: variant.sku,
      variantName: variant.name,
      price,
      quantity: 1,
    };
  });
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);

  await Order.create({
    orderCode: "MRSSEED0001",
    user: customer._id,
    items: orderItems,
    shippingAddress: {
      fullName: "Nguyễn Văn Khách",
      phone: "0912345678",
      province: "Hà Nội",
      district: "Cầu Giấy",
      ward: "Dịch Vọng Hậu",
      street: "Số 12, ngõ 5 Trần Thái Tông",
    },
    paymentMethod: "cod",
    paymentStatus: "paid",
    orderStatus: "delivered",
    statusHistory: [
      { status: "pending", note: "Khách hàng đặt đơn", updatedAt: new Date(Date.now() - 6 * 864e5) },
      { status: "confirmed", note: "Đã xác nhận qua điện thoại", updatedAt: new Date(Date.now() - 5 * 864e5) },
      { status: "processing", note: "Đang đóng gói", updatedAt: new Date(Date.now() - 4 * 864e5) },
      { status: "shipping", note: "Đã bàn giao đơn vị vận chuyển", updatedAt: new Date(Date.now() - 3 * 864e5) },
      { status: "delivered", note: "Giao thành công", updatedAt: new Date(Date.now() - 2 * 864e5) },
    ],
    subtotal,
    shippingFee: 0,
    discount: 0,
    total: subtotal,
    deliveredAt: new Date(Date.now() - 2 * 864e5),
    paidAt: new Date(Date.now() - 2 * 864e5),
    createdAt: new Date(Date.now() - 6 * 864e5),
  });

  // Danh gia da duyet cho vai san pham dau (dung customer + admin de tranh trung unique index)
  const reviewers = [customer, admin];
  let reviewCount = 0;
  for (let i = 0; i < Math.min(5, createdProducts.length); i += 1) {
    const product = createdProducts[i];
    const sample = sampleReviews[i % sampleReviews.length];
    const reviewer = reviewers[i % reviewers.length];
    await Review.create({
      product: product._id,
      user: reviewer._id,
      rating: sample.rating,
      comment: sample.comment,
      isApproved: true,
    });
    reviewCount += 1;
  }
  // recalcProductRating chay bat dong bo trong post-save hook, tinh lai cho chac
  for (const p of createdProducts.slice(0, 5)) await Review.recalcProductRating(p._id);
  logger.info(`Đã tạo 1 đơn hàng mẫu và ${reviewCount} đánh giá`);

  logger.info("");
  logger.info("=== Tài khoản đăng nhập ===");
  users.forEach((u) => logger.info(`  ${u.role.padEnd(8)} ${u.email} / ${u.password}`));
  logger.info("");
};

const run = async () => {
  const shouldDestroy = process.argv.includes("--destroy");
  try {
    await connectDB();
    if (shouldDestroy) await destroy();
    else await seed();
    logger.info(shouldDestroy ? "Đã dọn sạch database" : "Seed dữ liệu thành công");
  } catch (err) {
    logger.error(err.stack || err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    await mongoose.connection.close().catch(() => {});
  }
};

run();
