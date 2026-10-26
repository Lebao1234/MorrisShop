import { jest } from "@jest/globals";
import {
  connectTestDb,
  closeTestDb,
  clearCollections,
  createUser,
  createProduct,
  createCoupon,
  SHIPPING_ADDRESS,
} from "./helpers.js";
import { Product, Order, Coupon } from "../src/models/index.js";
import * as cartService from "../src/services/cart.service.js";
import * as orderService from "../src/services/order.service.js";
import * as couponService from "../src/services/coupon.service.js";
import { env } from "../src/config/env.js";

jest.setTimeout(30000);

beforeAll(connectTestDb);
afterAll(closeTestDb);
afterEach(clearCollections);

/** Dung gio hang co san cho cac test dat hang */
const seedCart = async ({ quantity = 2, price = 300000, salePrice = 0, stock = 10 } = {}) => {
  const { user } = await createUser();
  const product = await createProduct({
    variants: [{ name: "50g", price, salePrice, stock, sku: "IRON-50G" }],
  });
  await cartService.addItem(user._id, {
    productId: product._id,
    variantSku: "IRON-50G",
    quantity,
  });
  return { user, product };
};

describe("calcShippingFee", () => {
  it("tính phí ship khi chưa đạt ngưỡng miễn phí", () => {
    expect(orderService.calcShippingFee(env.shipping.freeThreshold - 1)).toBe(env.shipping.fee);
  });

  it("miễn phí ship khi đạt hoặc vượt ngưỡng", () => {
    expect(orderService.calcShippingFee(env.shipping.freeThreshold)).toBe(0);
    expect(orderService.calcShippingFee(env.shipping.freeThreshold + 100000)).toBe(0);
  });
});

describe("coupon.calcDiscount", () => {
  it("giảm theo phần trăm", async () => {
    const coupon = await createCoupon({ type: "percent", value: 10 });
    expect(coupon.calcDiscount(1000000)).toBe(100000);
  });

  it("tôn trọng mức giảm tối đa", async () => {
    const coupon = await createCoupon({ type: "percent", value: 50, maxDiscount: 100000 });
    expect(coupon.calcDiscount(1000000)).toBe(100000);
  });

  it("không giảm quá giá trị đơn hàng", async () => {
    const coupon = await createCoupon({ type: "fixed", value: 500000 });
    expect(coupon.calcDiscount(200000)).toBe(200000);
  });

  it("từ chối mã hết hạn", async () => {
    const coupon = await createCoupon({ expiresAt: new Date(Date.now() - 864e5) });
    expect(coupon.checkUsable(1000000).valid).toBe(false);
  });

  it("từ chối khi chưa đạt giá trị đơn tối thiểu", async () => {
    const coupon = await createCoupon({ minOrderValue: 500000 });
    const { valid, reason } = coupon.checkUsable(100000);
    expect(valid).toBe(false);
    expect(reason).toContain("tối thiểu");
  });
});

describe("orderService.createOrder — tính tiền", () => {
  it("tính tổng = tạm tính + phí ship − giảm giá", async () => {
    const { user } = await seedCart({ quantity: 1, price: 300000 });
    const coupon = await createCoupon({ type: "percent", value: 10 });

    const order = await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
      couponCode: coupon.code,
    });

    expect(order.subtotal).toBe(300000);
    expect(order.shippingFee).toBe(env.shipping.fee); // 300k < nguong 500k
    expect(order.discount).toBe(30000);
    expect(order.total).toBe(300000 + env.shipping.fee - 30000);
  });

  it("dùng giá khuyến mãi chứ không dùng giá gốc", async () => {
    const { user } = await seedCart({ quantity: 2, price: 400000, salePrice: 250000 });

    const order = await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
    });

    expect(order.subtotal).toBe(500000);
    expect(order.shippingFee).toBe(0); // dat nguong mien phi
    expect(order.total).toBe(500000);
  });

  it("bỏ qua giá do client gửi lên, luôn tính lại ở server", async () => {
    const { user } = await seedCart({ quantity: 1, price: 300000 });

    const order = await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
      subtotal: 1, // gia mao
      total: 1,
    });

    expect(order.subtotal).toBe(300000);
    expect(order.total).toBeGreaterThan(1);
  });

  it("từ chối khi giỏ hàng trống", async () => {
    const { user } = await createUser();
    await expect(
      orderService.createOrder(user._id, { shippingAddress: SHIPPING_ADDRESS, paymentMethod: "cod" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("orderService.createOrder — tồn kho", () => {
  it("trừ tồn kho và tăng số lượng đã bán", async () => {
    const { user, product } = await seedCart({ quantity: 3, stock: 10 });

    await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
    });

    const after = await Product.findById(product._id);
    expect(after.variants[0].stock).toBe(7);
    expect(after.soldCount).toBe(3);
  });

  it("xoá giỏ hàng sau khi đặt thành công", async () => {
    const { user } = await seedCart();
    await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
    });
    const cart = await cartService.getCart(user._id);
    expect(cart.items).toHaveLength(0);
  });

  it("không tạo đơn khi hàng vừa hết trong lúc thanh toán", async () => {
    const { user, product } = await seedCart({ quantity: 3, stock: 10 });

    // Mo phong khach khac mua het hang truoc mot nhip
    await Product.updateOne({ _id: product._id }, { $set: { "variants.0.stock": 1 } });

    await expect(
      orderService.createOrder(user._id, { shippingAddress: SHIPPING_ADDRESS, paymentMethod: "cod" }),
    ).rejects.toThrow();

    expect(await Order.countDocuments()).toBe(0);
    const after = await Product.findById(product._id);
    expect(after.variants[0].stock).toBe(1); // khong bi tru nham
  });

  it("hoàn lại tồn kho và lượt dùng mã khi huỷ đơn", async () => {
    const { user, product } = await seedCart({ quantity: 3, stock: 10 });
    const coupon = await createCoupon({ type: "fixed", value: 20000 });

    const order = await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
      couponCode: coupon.code,
    });
    expect((await Coupon.findById(coupon._id)).usedCount).toBe(1);

    await orderService.cancelOrder(order._id, user, "Khách đổi ý");

    const after = await Product.findById(product._id);
    expect(after.variants[0].stock).toBe(10);
    expect((await Coupon.findById(coupon._id)).usedCount).toBe(0);
  });
});

describe("orderService — luồng trạng thái", () => {
  const placeOrder = async () => {
    const { user } = await seedCart();
    const order = await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
    });
    return { user, order };
  };

  it("chặn bước nhảy cóc pending → delivered", async () => {
    const { order } = await placeOrder();
    const admin = { _id: order.user._id, role: "admin" };

    await expect(
      orderService.updateOrderStatus(order._id, { status: "delivered" }, admin),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("cho phép pending → confirmed và ghi lại lịch sử", async () => {
    const { order } = await placeOrder();
    const admin = { _id: order.user._id, role: "admin" };

    const updated = await orderService.updateOrderStatus(
      order._id,
      { status: "confirmed", note: "Đã gọi xác nhận" },
      admin,
    );

    expect(updated.orderStatus).toBe("confirmed");
    expect(updated.statusHistory).toHaveLength(2);
    expect(updated.statusHistory[1].note).toBe("Đã gọi xác nhận");
  });

  it("tự đánh dấu đã thanh toán khi đơn COD được giao", async () => {
    const { order } = await placeOrder();
    const admin = { _id: order.user._id, role: "admin" };

    await orderService.updateOrderStatus(order._id, { status: "confirmed" }, admin);
    await orderService.updateOrderStatus(order._id, { status: "processing" }, admin);
    await orderService.updateOrderStatus(order._id, { status: "shipping" }, admin);
    const delivered = await orderService.updateOrderStatus(order._id, { status: "delivered" }, admin);

    expect(delivered.paymentStatus).toBe("paid");
    expect(delivered.deliveredAt).toBeTruthy();
  });

  it("khách không huỷ được đơn đã rời trạng thái chờ xác nhận", async () => {
    const { user, order } = await placeOrder();
    const admin = { _id: user._id, role: "admin" };
    await orderService.updateOrderStatus(order._id, { status: "confirmed" }, admin);

    await expect(orderService.cancelOrder(order._id, user)).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("markPayment là idempotent, không ghi đè đơn đã thanh toán", async () => {
    const { order } = await placeOrder();
    await orderService.markPayment(order.orderCode, { success: true, ref: "REF-1" });
    const second = await orderService.markPayment(order.orderCode, { success: false, ref: "REF-2" });

    expect(second.paymentStatus).toBe("paid");
    expect(second.paymentRef).toBe("REF-1");
  });
});

describe("orderService.getOrderDetail — quyền xem", () => {
  it("chặn khách xem đơn của người khác", async () => {
    const { user } = await seedCart();
    const order = await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
    });

    const { user: other } = await createUser();
    await expect(orderService.getOrderDetail(order._id, other)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("cho phép nhân viên xem mọi đơn", async () => {
    const { user } = await seedCart();
    const order = await orderService.createOrder(user._id, {
      shippingAddress: SHIPPING_ADDRESS,
      paymentMethod: "cod",
    });

    const { user: staff } = await createUser({ role: "staff" });
    const found = await orderService.getOrderDetail(order.orderCode, staff);
    expect(found.orderCode).toBe(order.orderCode);
  });
});

describe("couponService.validateCoupon", () => {
  it("trả về số tiền giảm cho mã hợp lệ", async () => {
    const { user } = await createUser();
    const coupon = await createCoupon({ type: "percent", value: 20 });

    const result = await couponService.validateCoupon({
      code: coupon.code,
      subtotal: 500000,
      userId: user._id,
    });

    expect(result.discount).toBe(100000);
    expect(result.finalSubtotal).toBe(400000);
  });

  it("tôn trọng giới hạn lượt dùng của từng khách", async () => {
    const { user } = await createUser();
    const coupon = await createCoupon({ perUserLimit: 1 });

    await couponService.consumeCoupon(coupon._id, user._id);

    await expect(
      couponService.validateCoupon({ code: coupon.code, subtotal: 500000, userId: user._id }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
