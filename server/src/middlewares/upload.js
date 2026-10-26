import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";
import { uploadBuffer } from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED.includes(file.mimetype)) {
    return cb(ApiError.badRequest("Chỉ chấp nhận ảnh JPG, PNG, WEBP, AVIF, GIF"));
  }
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 10 },
  fileFilter,
});

const LOCAL_DIR = path.resolve(process.cwd(), "uploads");

/** Fallback khi chua cau hinh Cloudinary: luu file vao /uploads va tra URL tinh */
const saveLocally = async (file, folder) => {
  const dir = path.join(LOCAL_DIR, folder);
  fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return { url: `/uploads/${folder}/${filename}`, publicId: null };
};

/** Dua file (da qua multer memoryStorage) len storage, tra ve mang ket qua */
export const storeFiles = async (files, folder = "products") => {
  const list = Array.isArray(files) ? files : [files].filter(Boolean);
  return Promise.all(
    list.map((f) => (env.cloudinary.enabled ? uploadBuffer(f.buffer, `morris-shop/${folder}`) : saveLocally(f, folder))),
  );
};

export default upload;
