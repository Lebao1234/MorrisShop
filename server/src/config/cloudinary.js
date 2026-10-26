import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";
import logger from "../utils/logger.js";

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  logger.info("Cloudinary đã được cấu hình");
} else {
  logger.warn("Cloudinary chưa cấu hình - upload sẽ lưu vào thư mục /uploads (local fallback)");
}

/** Upload buffer len Cloudinary, tra ve { url, publicId } */
export const uploadBuffer = (buffer, folder = "morris-shop") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });

export const destroyImage = (publicId) => cloudinary.uploader.destroy(publicId);

export default cloudinary;
