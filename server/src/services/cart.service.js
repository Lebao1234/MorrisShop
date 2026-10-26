import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { pickPrice } from "../utils/helpers.js";

const getOrCreate = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

/**
 * Lam giau gio hang bang du lieu san pham hien tai (gia moi nhat, ton kho),
 * tu loai bo item tro toi san pham/variant khong con ton tai.
 */
export const hydrateCart = async (cart) => {
  const productIds = cart.items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } })
    .select("name slug images variants isActive")
    .lean({ virtuals: true });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  let removed = 0;

  for (const item of cart.items) {
    const product = byId.get(String(item.product));
    const variant = product?.variants?.find((v) => v.sku === item.variantSku);
    if (!product || !product.isActive || !variant) {
      removed += 1;
      continue;
    }
    const price = pickPrice(variant);
    items.push({
      _id: item._id,
      product: {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || "",
      },
      variantSku: variant.sku,
      variantName: variant.name,
      price,
      originalPrice: variant.price,
      priceAtAdd: item.priceAtAdd,
      priceChanged: price !== item.priceAtAdd,
      quantity: item.quantity,
      stock: variant.stock,
      lineTotal: price * item.quantity,
      outOfStock: variant.stock < item.quantity,
    });
  }

  if (removed > 0) {
    cart.items = cart.items.filter((i) =>
      items.some((hydrated) => String(hydrated._id) === String(i._id)),
    );
    await cart.save();
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);

  return { _id: cart._id, items, subtotal, totalQuantity, updatedAt: cart.updatedAt };
};

export const getCart = async (userId) => hydrateCart(await getOrCreate(userId));

export const addItem = async (userId, { productId, variantSku, quantity = 1 }) => {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw ApiError.notFound("Sản phẩm không tồn tại");

  const variant = product.findVariant(variantSku);
  if (!variant) throw ApiError.badRequest("Phiên bản sản phẩm không hợp lệ");

  const cart = await getOrCreate(userId);
  const existing = cart.items.find(
    (i) => String(i.product) === String(productId) && i.variantSku === variant.sku,
  );

  const nextQty = (existing?.quantity || 0) + quantity;
  if (nextQty > variant.stock) {
    throw ApiError.badRequest(
      variant.stock === 0 ? "Sản phẩm đã hết hàng" : `Chỉ còn ${variant.stock} sản phẩm trong kho`,
    );
  }

  if (existing) existing.quantity = nextQty;
  else
    cart.items.push({
      product: product._id,
      variantSku: variant.sku,
      quantity,
      priceAtAdd: pickPrice(variant),
    });

  await cart.save();
  return hydrateCart(cart);
};

export const updateItem = async (userId, itemId, quantity) => {
  const cart = await getOrCreate(userId);
  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound("Không tìm thấy sản phẩm trong giỏ hàng");

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    const product = await Product.findById(item.product);
    const variant = product?.findVariant(item.variantSku);
    if (!variant) throw ApiError.badRequest("Phiên bản sản phẩm không còn tồn tại");
    if (quantity > variant.stock) throw ApiError.badRequest(`Chỉ còn ${variant.stock} sản phẩm trong kho`);
    item.quantity = quantity;
  }

  await cart.save();
  return hydrateCart(cart);
};

export const removeItem = async (userId, itemId) => {
  const cart = await getOrCreate(userId);
  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound("Không tìm thấy sản phẩm trong giỏ hàng");
  item.deleteOne();
  await cart.save();
  return hydrateCart(cart);
};

export const clearCart = async (userId) => {
  const cart = await getOrCreate(userId);
  cart.items = [];
  await cart.save();
  return hydrateCart(cart);
};

/** Gop gio hang luu o localStorage (khach chua dang nhap) vao gio hang server */
export const mergeGuestCart = async (userId, guestItems = []) => {
  for (const item of guestItems) {
    try {
      await addItem(userId, {
        productId: item.productId,
        variantSku: item.variantSku,
        quantity: item.quantity || 1,
      });
    } catch {
      /* bo qua item khong hop le */
    }
  }
  return getCart(userId);
};

export default { getCart, addItem, updateItem, removeItem, clearCart, mergeGuestCart, hydrateCart };
