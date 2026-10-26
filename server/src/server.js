import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import logger from "./utils/logger.js";

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`Không thể kết nối MongoDB: ${err.message}`);
    logger.error("Kiểm tra MONGO_URI trong server/.env, hoặc chạy 'npm run db:up' để bật MongoDB bằng Docker");
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`Server chạy tại http://localhost:${env.port} (${env.nodeEnv})`);
    logger.info(`Tài liệu API: http://localhost:${env.port}/api-docs`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} - đang tắt server...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled rejection: ${reason?.stack || reason}`);
  });
  process.on("uncaughtException", (err) => {
    logger.error(`Uncaught exception: ${err.stack || err.message}`);
    shutdown("uncaughtException");
  });
};

start();
