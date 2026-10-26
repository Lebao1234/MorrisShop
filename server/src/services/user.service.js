import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { parsePagination } from "../utils/helpers.js";
import * as userRepo from "../repositories/user.repository.js";

export const listUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query, 15);
  const filter = userRepo.buildUserFilter({
    search: query.search,
    role: query.role,
    isBlocked: query.isBlocked === undefined ? undefined : query.isBlocked === "true" || query.isBlocked === true,
  });
  const { items, total } = await userRepo.findUsers(filter, { skip, limit });
  return { items, total, page, limit };
};

export const getUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
  return user.toSafeJSON();
};

/** Khach tu cap nhat ho so - khong cho tu doi role/isBlocked */
export const updateProfile = async (id, data) => {
  const allowed = ["name", "phone", "avatar"];
  const payload = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k)),
  );
  const user = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
  return user.toSafeJSON();
};

/** Admin cap nhat - duoc phep doi role */
export const adminUpdateUser = async (id, data) => {
  const allowed = ["name", "phone", "avatar", "role", "isBlocked", "isVerified"];
  const payload = Object.fromEntries(
    Object.entries(data).filter(([k]) => allowed.includes(k)),
  );
  const user = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
  return user.toSafeJSON();
};

export const setBlocked = async (id, isBlocked, actorId) => {
  if (String(id) === String(actorId)) throw ApiError.badRequest("Bạn không thể tự khoá tài khoản của mình");

  const target = await User.findById(id);
  if (!target) throw ApiError.notFound("Không tìm thấy người dùng");
  if (target.role === "admin") throw ApiError.forbidden("Không thể khoá tài khoản admin");

  target.isBlocked = isBlocked;
  if (isBlocked) target.refreshToken = null;
  await target.save();
  return target.toSafeJSON();
};

export const deleteUser = async (id, actorId) => {
  if (String(id) === String(actorId)) throw ApiError.badRequest("Bạn không thể xoá tài khoản của mình");
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
  if (user.role === "admin") throw ApiError.forbidden("Không thể xoá tài khoản admin");
  await User.findByIdAndDelete(id);
  return user.toSafeJSON();
};

/* ------------------------------- Dia chi ------------------------------- */

export const addAddress = async (userId, address) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

  if (address.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  if (user.addresses.length === 0) address.isDefault = true;

  user.addresses.push(address);
  await user.save();
  return user.addresses;
};

export const updateAddress = async (userId, addressId, data) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

  const address = user.addresses.id(addressId);
  if (!address) throw ApiError.notFound("Không tìm thấy địa chỉ");

  if (data.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(address, data);
  await user.save();
  return user.addresses;
};

export const deleteAddress = async (userId, addressId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

  const address = user.addresses.id(addressId);
  if (!address) throw ApiError.notFound("Không tìm thấy địa chỉ");

  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;

  await user.save();
  return user.addresses;
};

/* ------------------------------ Wishlist ------------------------------ */

export const getWishlist = async (userId) => {
  const user = await User.findById(userId).populate({
    path: "wishlist",
    match: { isActive: true },
    populate: { path: "category", select: "name slug" },
  });
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");
  return user.wishlist;
};

export const toggleWishlist = async (userId, productId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("Không tìm thấy người dùng");

  const index = user.wishlist.findIndex((p) => String(p) === String(productId));
  const added = index === -1;
  if (added) user.wishlist.push(productId);
  else user.wishlist.splice(index, 1);

  await user.save();
  return { added, wishlist: user.wishlist };
};

export default {
  listUsers,
  getUser,
  updateProfile,
  adminUpdateUser,
  setBlocked,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
};
