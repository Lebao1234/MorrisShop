import { jest } from "@jest/globals";
import {
  connectTestDb,
  closeTestDb,
  clearCollections,
  api,
  createUser,
  createUserAndLogin,
} from "./helpers.js";
import { User } from "../src/models/index.js";
import * as authService from "../src/services/auth.service.js";

jest.setTimeout(30000);

beforeAll(connectTestDb);
afterAll(closeTestDb);
afterEach(clearCollections);

describe("authService.register", () => {
  it("băm mật khẩu và không trả mật khẩu về client", async () => {
    const result = await authService.register({
      name: "Nguyễn Văn A",
      email: "a@morrisshop.vn",
      password: "matkhau123",
    });

    expect(result.user.password).toBeUndefined();
    expect(result.accessToken).toEqual(expect.any(String));

    const stored = await User.findOne({ email: "a@morrisshop.vn" }).select("+password");
    expect(stored.password).not.toBe("matkhau123");
    expect(await stored.comparePassword("matkhau123")).toBe(true);
  });

  it("từ chối email đã tồn tại", async () => {
    await createUser({ email: "trung@morrisshop.vn" });
    await expect(
      authService.register({ name: "B", email: "trung@morrisshop.vn", password: "matkhau123" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("gán vai trò mặc định là customer", async () => {
    const { user } = await authService.register({
      name: "C",
      email: "c@morrisshop.vn",
      password: "matkhau123",
    });
    expect(user.role).toBe("customer");
  });
});

describe("authService.login", () => {
  it("từ chối sai mật khẩu bằng đúng thông điệp chung", async () => {
    const { user } = await createUser({ password: "matkhau123" });
    await expect(authService.login({ email: user.email, password: "sai-mat-khau" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("chặn tài khoản đã bị khoá", async () => {
    const { user, password } = await createUser({ isBlocked: true });
    await expect(authService.login({ email: user.email, password })).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("lưu refresh token đã băm chứ không lưu bản gốc", async () => {
    const { user, password } = await createUser();
    const { refreshToken } = await authService.login({ email: user.email, password });

    const stored = await User.findById(user._id).select("+refreshToken");
    expect(stored.refreshToken).toBeTruthy();
    expect(stored.refreshToken).not.toBe(refreshToken);
  });
});

describe("authService.refresh", () => {
  it("xoay vòng refresh token và vô hiệu hoá token cũ", async () => {
    const { user, password } = await createUser();
    const first = await authService.login({ email: user.email, password });

    const second = await authService.refresh(first.refreshToken);
    expect(second.accessToken).toEqual(expect.any(String));

    // Token cu khong con dung duoc nua
    await expect(authService.refresh(first.refreshToken)).rejects.toMatchObject({ statusCode: 401 });
  });

  it("từ chối token rác", async () => {
    await expect(authService.refresh("khong-phai-jwt")).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("authService.changePassword", () => {
  it("yêu cầu đúng mật khẩu hiện tại", async () => {
    const { user } = await createUser({ password: "matkhau123" });
    await expect(
      authService.changePassword(user._id, { currentPassword: "sai", newPassword: "matkhaumoi" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("đổi mật khẩu thành công và mật khẩu mới đăng nhập được", async () => {
    const { user } = await createUser({ password: "matkhau123" });
    await authService.changePassword(user._id, {
      currentPassword: "matkhau123",
      newPassword: "matkhaumoi",
    });

    const result = await authService.login({ email: user.email, password: "matkhaumoi" });
    expect(result.user._id.toString()).toBe(user._id.toString());
  });
});

describe("HTTP /api/auth", () => {
  it("POST /register trả 400 kèm chi tiết lỗi khi dữ liệu sai", async () => {
    const res = await api()
      .post("/api/auth/register")
      .send({ name: "A", email: "khong-phai-email", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("POST /login đặt refresh token vào httpOnly cookie", async () => {
    const { user, password } = await createUser();
    const res = await api().post("/api/auth/login").send({ email: user.email, password });

    expect(res.status).toBe(200);
    const cookie = res.headers["set-cookie"].join(";");
    expect(cookie).toContain("refreshToken=");
    expect(cookie).toContain("HttpOnly");
  });

  it("GET /me trả 401 khi thiếu token", async () => {
    const res = await api().get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /me trả hồ sơ khi có token hợp lệ", async () => {
    const { user, token } = await createUserAndLogin();
    const res = await api().get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data.password).toBeUndefined();
  });
});
