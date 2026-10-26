/**
 * MongoDB in-memory cho moi truong dev khi khong co Docker / MongoDB cai san.
 * Chay: npm run db:memory  (giu terminal nay mo, sau do chay npm run seed va npm run dev)
 *
 * Luu y: du lieu chi ton tai trong RAM, tat process la mat. Dung MongoDB Atlas hoac
 * `npm run db:up` (Docker) cho moi truong can du lieu ben vung.
 */
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = Number(process.env.MEMORY_DB_PORT || 27017);

const start = async () => {
  console.log("Dang khoi dong MongoDB in-memory (lan dau se tai binary, vui long doi)...");

  const mongod = await MongoMemoryServer.create({
    instance: { port: PORT, dbName: "morris_shop" },
  });

  const uri = mongod.getUri("morris_shop");
  console.log("");
  console.log("MongoDB in-memory da san sang:");
  console.log(`  MONGO_URI=${uri}`);
  console.log("");
  console.log("Mo terminal khac va chay:  npm run seed  roi  npm run dev");
  console.log("Nhan Ctrl+C de dung.");

  const stop = async () => {
    console.log("\nDang dung MongoDB in-memory...");
    await mongod.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
};

start().catch((err) => {
  console.error("Khong the khoi dong MongoDB in-memory:", err.message);
  process.exit(1);
});
