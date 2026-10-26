import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // gui httpOnly refresh cookie
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

/* -------------------- Quan ly access token trong bo nho -------------------- */
// Access token khong luu localStorage de giam be mat tan cong XSS;
// refresh token nam trong httpOnly cookie va duoc dung de khoi phuc phien.

let accessToken = null;
let onUnauthorized = null;

export const setAccessToken = (token) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

axiosClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

/* ----------------------- Tu dong refresh khi 401 ----------------------- */

let refreshPromise = null;

const refreshAccessToken = async () => {
  refreshPromise ||= axios
    .post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true })
    .then((res) => {
      const token = res.data?.data?.accessToken;
      setAccessToken(token);
      return token;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

const SKIP_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh-token", "/auth/forgot-password"];

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error;

    if (
      response?.status === 401 &&
      config &&
      !config._retried &&
      !SKIP_REFRESH.some((path) => config.url?.includes(path))
    ) {
      config._retried = true;
      try {
        const token = await refreshAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return axiosClient(config);
        }
      } catch {
        setAccessToken(null);
        onUnauthorized?.();
      }
    }

    const message =
      response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Máy chủ phản hồi quá lâu, vui lòng thử lại"
        : error.message === "Network Error"
          ? "Không kết nối được tới máy chủ. Kiểm tra server đã chạy chưa (npm run dev:server)."
          : "Đã có lỗi xảy ra, vui lòng thử lại");

    return Promise.reject(
      Object.assign(new Error(message), {
        status: response?.status,
        errors: response?.data?.errors,
        raw: error,
      }),
    );
  },
);

/** Client rieng cho upload multipart */
export const uploadClient = axios.create({ baseURL: BASE_URL, withCredentials: true, timeout: 60000 });
uploadClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
uploadClient.interceptors.response.use(
  (res) => res.data,
  (error) =>
    Promise.reject(new Error(error.response?.data?.message || "Tải ảnh lên thất bại, vui lòng thử lại")),
);

export default axiosClient;
