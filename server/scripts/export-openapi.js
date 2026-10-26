/**
 * Xuất OpenAPI spec ra docs/openapi.json để import vào Postman / Insomnia
 * mà không cần khởi động server.
 *
 * Chạy: npm run docs:export --workspace server
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { swaggerSpec } from "../src/docs/swaggerConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, "../../docs/openapi.json");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(swaggerSpec, null, 2), "utf-8");

const paths = Object.keys(swaggerSpec.paths || {}).length;
const schemas = Object.keys(swaggerSpec.components?.schemas || {}).length;
console.log(`Đã xuất ${paths} endpoint và ${schemas} schema vào ${path.relative(process.cwd(), out)}`);
