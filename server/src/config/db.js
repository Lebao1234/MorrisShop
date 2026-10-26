import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env.js";
import logger from "../utils/logger.js";

// Khac phuc loi querySrv ECONNREFUSED tren Windows khi resolve DNS SRV cua MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  /* bo qua neu moi truong khong cho phep */
}

mongoose.set("strictQuery", true);

export const connectDB = async (uri = env.mongoUri) => {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  logger.info(`MongoDB đã kết nối: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

export const disconnectDB = () => mongoose.disconnect();

export default connectDB;
