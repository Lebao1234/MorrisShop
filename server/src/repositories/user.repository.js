import User from "../models/User.js";

export const findByEmail = (email, withPassword = false) => {
  const q = User.findOne({ email: String(email).toLowerCase().trim() });
  return withPassword ? q.select("+password") : q;
};

export const findById = (id) => User.findById(id);

export const createUser = (data) => User.create(data);

export const findUsers = async (filter, { sort = { createdAt: -1 }, skip = 0, limit = 12 } = {}) => {
  const [items, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return { items, total };
};

export const buildUserFilter = ({ search, role, isBlocked }) => {
  const filter = {};
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked;
  if (search) {
    const rx = new RegExp(String(search).trim(), "i");
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }
  return filter;
};

export default { findByEmail, findById, createUser, findUsers, buildUserFilter };
