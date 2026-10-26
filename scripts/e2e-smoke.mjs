/**
 * Kiểm thử end-to-end bằng headless Chromium: đi hết các luồng chính của cửa
 * hàng và khu vực quản trị, chụp ảnh màn hình và thu thập lỗi console.
 *
 * Yêu cầu server (:5000) và client (:5173) đang chạy — `npm run dev`.
 * Chạy: npm run e2e     → ảnh lưu trong .e2e-shots/
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(fileURLToPath(new URL("../.e2e-shots", import.meta.url)));
fs.mkdirSync(OUT, { recursive: true });

const BASE = "http://localhost:5173";
const errors = [];
const failedRequests = [];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await context.newPage();

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`[${page.url()}] ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`[PAGEERROR ${page.url()}] ${err.message}`));
page.on("requestfailed", (req) => {
  const url = req.url();
  // Bo qua anh placeholder ben ngoai / video mau
  if (/picsum|googleapis|gstatic|commondatastorage/.test(url)) return;
  failedRequests.push(`${req.method()} ${url} — ${req.failure()?.errorText}`);
});

const shot = async (name, full = false) => {
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: full });
  console.log(`  shot: ${name}.png`);
};

const step = async (label, fn) => {
  process.stdout.write(`\n>> ${label}\n`);
  try {
    await fn();
    console.log("   OK");
  } catch (e) {
    console.log(`   FAIL: ${e.message}`);
    errors.push(`[STEP ${label}] ${e.message}`);
    await page.screenshot({ path: path.join(OUT, `FAIL-${label.replace(/\W+/g, "-")}.png`) }).catch(() => {});
  }
};

await step("Trang chu", async () => {
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForSelector("text=MORRIS", { timeout: 15000 });
  await shot("01-home-hero");
  await page.evaluate(() => window.scrollBy(0, 1400));
  await shot("02-home-collections");
  await page.evaluate(() => window.scrollBy(0, 1600));
  await shot("03-home-bestsellers");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await shot("04-home-footer");
});

await step("Menu toan man hinh", async () => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.locator('button[aria-label="Mở menu"]:visible').first().click();
  await shot("05-fullscreen-menu");
  await page.keyboard.press("Escape").catch(() => {});
  await page.locator('button[aria-label="Đóng menu"]:visible').first().click().catch(() => {});
});

await step("Tim kiem", async () => {
  await page.click('button[aria-label="Tìm kiếm sản phẩm"]');
  await page.fill('input[aria-label="Từ khoá tìm kiếm"]', "clay");
  await page.waitForTimeout(1200);
  await shot("06-search");
  await page.click('button[aria-label="Đóng tìm kiếm"]');
});

await step("Trang shop + bo loc", async () => {
  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await page.waitForSelector("article", { timeout: 15000 });
  const count = await page.locator("article").count();
  console.log(`   ${count} the san pham`);
  if (count === 0) throw new Error("Khong render duoc san pham nao");
  await shot("07-shop");

  await page.click('label[for="hold-high"]');
  await page.waitForTimeout(1400);
  await shot("08-shop-filtered");
  const filtered = await page.locator("article").count();
  console.log(`   sau khi loc giu nep cao: ${filtered} san pham`);
});

await step("Chi tiet san pham", async () => {
  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await page.locator("article a").first().click();
  await page.waitForSelector("h1", { timeout: 15000 });
  const title = await page.locator("h1").first().textContent();
  console.log(`   san pham: ${title?.trim()}`);
  await shot("09-product-detail");

  await page.click("text=Thành phần");
  await page.waitForTimeout(600);
  await shot("10-product-tabs");

  await page.click('button:has-text("Thêm vào giỏ")');
  await page.waitForTimeout(1600);
  await shot("11-cart-drawer");
});

await step("Trang gio hang", async () => {
  await page.goto(`${BASE}/gio-hang`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot("12-cart-page", true);
});

await step("Dang nhap", async () => {
  await page.goto(`${BASE}/dang-nhap`, { waitUntil: "networkidle" });
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await shot("13-login");
  await page.fill('input[type="email"]', "admin@morrisshop.vn");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 20000 });
  console.log(`   dieu huong toi: ${page.url()}`);
});

await step("Admin dashboard", async () => {
  await page.waitForSelector("text=Tổng quan", { timeout: 20000 });
  await page.waitForTimeout(2500);
  await shot("14-admin-dashboard", true);
});

await step("Admin - don hang", async () => {
  await page.click('a[href="/admin/don-hang"]');
  await page.waitForTimeout(2000);
  await shot("15-admin-orders");
});

await step("Admin - san pham", async () => {
  await page.click('a[href="/admin/san-pham"]');
  await page.waitForTimeout(2000);
  await shot("16-admin-products");
  await page.click('button:has-text("Thêm sản phẩm")');
  await page.waitForTimeout(1200);
  await shot("17-admin-product-dialog");
  await page.keyboard.press("Escape");
});

await step("Admin - ma giam gia", async () => {
  await page.click('a[href="/admin/ma-giam-gia"]');
  await page.waitForTimeout(1800);
  await shot("18-admin-coupons");
});

await step("Tai khoan khach", async () => {
  await page.goto(`${BASE}/tai-khoan/don-hang`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot("19-account-orders");
});

await step("Trang gioi thieu", async () => {
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot("20-about", true);
});

await step("Mobile - trang chu", async () => {
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mp = await mobile.newPage();
  mp.on("pageerror", (err) => errors.push(`[MOBILE PAGEERROR] ${err.message}`));
  await mp.goto(BASE, { waitUntil: "networkidle" });
  await mp.waitForTimeout(1500);
  await mp.screenshot({ path: path.join(OUT, "21-mobile-home.png") });
  await mp.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await mp.waitForTimeout(1500);
  await mp.screenshot({ path: path.join(OUT, "22-mobile-shop.png") });
  console.log("  shot: 21-mobile-home.png, 22-mobile-shop.png");
  await mobile.close();
});

await browser.close();

console.log("\n=================== KET QUA ===================");
console.log(`Loi console/page: ${errors.length}`);
errors.forEach((e) => console.log(`  ! ${e}`));
console.log(`Request that bai: ${failedRequests.length}`);
failedRequests.slice(0, 15).forEach((r) => console.log(`  ! ${r}`));
console.log(`\nScreenshots: ${OUT}`);
process.exit(errors.length ? 1 : 0);
