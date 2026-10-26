import Banner from "../models/Banner.js";
import ApiError from "../utils/ApiError.js";

export const listBanners = ({ type, includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };
  if (type) filter.type = type;
  return Banner.find(filter).sort({ type: 1, position: 1 }).lean();
};

/** Gom banner theo type de trang chu chi can 1 request */
export const getHomeContent = async () => {
  const banners = await Banner.find({ isActive: true }).sort({ position: 1 }).lean();
  return banners.reduce((acc, b) => {
    (acc[b.type] ||= []).push(b);
    return acc;
  }, {});
};

export const createBanner = (data) => Banner.create(data);

export const updateBanner = async (id, data) => {
  const banner = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!banner) throw ApiError.notFound("Không tìm thấy banner");
  return banner;
};

export const deleteBanner = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw ApiError.notFound("Không tìm thấy banner");
  return banner;
};

export default { listBanners, getHomeContent, createBanner, updateBanner, deleteBanner };
