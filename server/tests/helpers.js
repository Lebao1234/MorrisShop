import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../src/app.js";
import { User, Category, Product, Coupon } from "../src/models/index.js";

let mongod;

/** Khoi dong MongoDB trong bo nho rieng cho moi lan chay test */
export const connectTestDb = async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri(), { dbName: "morris_test" });
};

export const closeTestDb = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongod?.stop();
};

export const clearCollections = async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
};

export const api = () => request(app);

/* --------------------------- Du lieu dung chung --------------------------- */

export const createUser = async (overrides = {}) => {
  const password = overrides.password || "matkhau123";
  const user = await User.create({
    name: "Nguyễn Văn Test",
    email: `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@morrisshop.vn`,
    password,
    role: "customer",
    ...overrides,
  });
  return { user, password };
};

/** Dang nhap va tra ve accessToken de gan vao header Authorization */
export const loginAs = async (email, password) => {
  const res = await api().post("/api/auth/login").send({ email, password });
  if (!res.body?.data?.accessToken) {
    throw new Error(`Đăng nhập thất bại trong test: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.accessToken;
};

export const createUserAndLogin = async (overrides = {}) => {
  const { user, password } = await createUser(overrides);
  const token = await loginAs(user.email, password);
  return { user, token, password };
};

export const createCategory = (overrides = {}) =>
  Category.create({ name: "Sáp vuốt tóc", slug: `sap-${Date.now()}`, ...overrides });

export const createProduct = async (overrides = {}) => {
  const category = overrides.category || (await createCategory())._id;
  return Product.create({
    name: "Iron Clay Matte Wax",
    slug: `iron-clay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    category,
    images: ["https://example.com/a.jpg"],
    holdLevel: "high",
    finish: "matte",
    variants: [{ name: "50g", price: 300000, salePrice: 0, stock: 10, sku: `IRON-50G-${Date.now()}` }],
    ...overrides,
  });
};

export const createCoupon = (overrides = {}) =>
  Coupon.create({
    code: `TEST${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    type: "percent",
    value: 10,
    minOrderValue: 0,
    maxDiscount: 0,
    expiresAt: new Date(Date.now() + 7 * 864e5),
    isActive: true,
    ...overrides,
  });

export const SHIPPING_ADDRESS = {
  fullName: "Nguyễn Văn Khách",
  phone: "0912345678",
  province: "Hà Nội",
  district: "Cầu Giấy",
  ward: "Dịch Vọng Hậu",
  street: "Số 12, ngõ 5 Trần Thái Tông",
};
