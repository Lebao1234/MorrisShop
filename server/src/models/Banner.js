import mongoose from "mongoose";

export const BANNER_TYPES = ["hero_video", "hero_image", "collection_banner", "promo", "story"];

const bannerSchema = new mongoose.Schema(
  {
    type: { type: String, enum: BANNER_TYPES, required: true, index: true },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    eyebrow: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    mediaUrl: { type: String, required: true },
    posterUrl: { type: String, default: "" }, // anh poster cho video
    linkUrl: { type: String, default: "/shop" },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
