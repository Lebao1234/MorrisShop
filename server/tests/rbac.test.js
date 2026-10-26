import { jest } from "@jest/globals";
import {
  connectTestDb,
  closeTestDb,
  clearCollections,
  api,
  createUser,
  createUserAndLogin,
  createCategory,
  createProduct,
} from "./helpers.js";
import { authorize } from "../src/middlewares/auth.js";
import * as cartService from "../src/services/cart.service.js";

jest.setTimeout(30000);

beforeAll(connectTestDb);
afterAll(closeTestDb);
afterEach(clearCollections);

describe("middleware authorize()", () => {
  const run = (user, roles) =>
    new Promise((resolve) => {
      const req = { user };
      authorize(...roles)(req, {}, (err) => resolve(err));
    });

  it("cho qua khi vai trò nằm trong danh sách cho phép", async () => {
    expect(await run({ role: "admin" }, ["admin"])).toBeUndefined();
    expect(await run({ role: "staff" }, ["admin", "staff"])).toBeUndefined();
  });

  it("trả 403 khi vai trò không đủ quyền", async () => {
    expect(await run({ role: "customer" }, ["admin"])).toMatchObject({ statusCode: 403 });
    expect(await run({ role: "staff" }, ["admin"])).toMatchObject({ statusCode: 403 });
  });

  it("trả 401 khi chưa đăng nhập", async () => {
    expect(await run(undefined, ["admin"])).toMatchObject({ statusCode: 401 });
  });
});

describe("Phân quyền trên HTTP", () => {
  const productPayload = (categoryId) => ({
    name: "Sản phẩm test phân quyền",
    category: String(categoryId),
    images: ["https://example.com/a.jpg"],
    variants: [{ name: "50g", price: 199000, stock: 5 }],
  });

  it("khách vãng lai không tạo được sản phẩm", async () => {
    const category = await createCategory();
    const res = await api().post("/api/products").send(productPayload(category._id));
    expect(res.status).toBe(401);
  });

  it("khách hàng không tạo được sản phẩm", async () => {
    const category = await createCategory();
    const { token } = await createUserAndLogin({ role: "customer" });

    const res = await api()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(productPayload(category._id));

    expect(res.status).toBe(403);
  });

  it("nhân viên không tạo được sản phẩm nhưng cập nhật được tồn kho", async () => {
    const category = await createCategory();
    const { token } = await createUserAndLogin({ role: "staff" });
    const product = await createProduct({ category: category._id });

    const create = await api()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(productPayload(category._id));
    expect(create.status).toBe(403);

    const stock = await api()
      .patch(`/api/products/${product._id}/stock`)
      .set("Authorization", `Bearer ${token}`)
      .send({ updates: [{ sku: product.variants[0].sku, stock: 42 }] });

    expect(stock.status).toBe(200);
    expect(stock.body.data.variants[0].stock).toBe(42);
  });

  it("quản trị viên tạo được sản phẩm và slug/SKU sinh tự động", async () => {
    const category = await createCategory();
    const { token } = await createUserAndLogin({ role: "admin" });

    const res = await api()
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(productPayload(category._id));

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe("san-pham-test-phan-quyen");
    expect(res.body.data.variants[0].sku).toEqual(expect.any(String));
  });

  it("nhân viên không xoá được người dùng", async () => {
    const { token } = await createUserAndLogin({ role: "staff" });
    const { user: victim } = await createUser();

    const res = await api().delete(`/api/users/${victim._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("quản trị viên không tự khoá được tài khoản của mình", async () => {
    const { user, token } = await createUserAndLogin({ role: "admin" });

    const res = await api()
      .put(`/api/users/${user._id}/block`)
      .set("Authorization", `Bearer ${token}`)
      .send({ isBlocked: true });

    expect(res.status).toBe(400);
  });

  it("tài khoản bị khoá không gọi được API cần đăng nhập", async () => {
    const { user, token } = await createUserAndLogin();
    user.isBlocked = true;
    await user.save();

    const res = await api().get("/api/cart").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});

describe("Chặn đánh giá khi chưa mua hàng", () => {
  it("trả 403 nếu khách chưa nhận sản phẩm", async () => {
    const { token } = await createUserAndLogin();
    const product = await createProduct();

    const res = await api()
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: String(product._id), rating: 5, comment: "Sản phẩm rất tốt, giữ nếp lâu" });

    expect(res.status).toBe(403);
  });
});

describe("Giỏ hàng kiểm tra tồn kho", () => {
  it("không cho thêm quá số lượng còn trong kho", async () => {
    const { user } = await createUser();
    const product = await createProduct({
      variants: [{ name: "50g", price: 200000, salePrice: 0, stock: 2, sku: "LOW-50G" }],
    });

    await expect(
      cartService.addItem(user._id, { productId: product._id, variantSku: "LOW-50G", quantity: 5 }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("cộng dồn số lượng khi thêm lại cùng một phiên bản", async () => {
    const { user } = await createUser();
    const product = await createProduct({
      variants: [{ name: "50g", price: 200000, salePrice: 0, stock: 10, sku: "SUM-50G" }],
    });

    await cartService.addItem(user._id, { productId: product._id, variantSku: "SUM-50G", quantity: 2 });
    const cart = await cartService.addItem(user._id, {
      productId: product._id,
      variantSku: "SUM-50G",
      quantity: 3,
    });

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5);
    expect(cart.subtotal).toBe(1000000);
  });
});
