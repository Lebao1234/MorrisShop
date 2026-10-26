import Order from "../models/Order.js";

export const createOrder = (data) => Order.create(data);

export const findByCodeOrId = (idOrCode) => {
  const isObjectId = /^[a-f\d]{24}$/i.test(String(idOrCode));
  return Order.findOne(isObjectId ? { _id: idOrCode } : { orderCode: String(idOrCode).toUpperCase() })
    .populate("user", "name email phone")
    .populate("items.product", "name slug images");
};

export const findOrders = async (filter, { sort = { createdAt: -1 }, skip = 0, limit = 12 } = {}) => {
  const [items, total] = await Promise.all([
    Order.find(filter).populate("user", "name email").sort(sort).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return { items, total };
};

export const buildOrderFilter = ({ status, paymentStatus, paymentMethod, user, search, from, to }) => {
  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (user) filter.user = user;
  if (search) filter.orderCode = new RegExp(String(search).trim(), "i");
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  return filter;
};

/** Kiem tra user da mua (va nhan) san pham nay chua - dung de gate review */
export const hasPurchased = (userId, productId) =>
  Order.exists({
    user: userId,
    "items.product": productId,
    orderStatus: "delivered",
  });

export default { createOrder, findByCodeOrId, findOrders, buildOrderFilter, hasPurchased };
