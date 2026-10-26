import { create } from "zustand";
import { authApi } from "@/services/api";
import { setAccessToken, setUnauthorizedHandler } from "@/services/axiosClient";

/**
 * Refresh token nam trong httpOnly cookie nen JS khong doc duoc. Ta danh dau
 * "co phien" trong localStorage de khach vang lai khong phai goi /refresh-token
 * (tranh 401 vo ich moi lan tai trang).
 */
const SESSION_HINT = "morris-session";
const hasSessionHint = () => {
  try {
    return window.localStorage.getItem(SESSION_HINT) === "1";
  } catch {
    return true; // khong doc duoc storage thi cu thu refresh
  }
};
const setSessionHint = (value) => {
  try {
    if (value) window.localStorage.setItem(SESSION_HINT, "1");
    else window.localStorage.removeItem(SESSION_HINT);
  } catch {
    /* che do rieng tu / storage bi chan */
  }
};

/**
 * Refresh token duoc xoay vong moi lan dung, nen hai lan goi bootstrap song song
 * (React StrictMode goi effect hai lan trong dev) se khien lan thu hai nhan 401.
 * Giu lai promise dang chay de moi phien chi refresh dung mot lan.
 */
let bootstrapPromise = null;

export const useAuthStore = create((set, get) => ({
  user: null,
  status: "idle", // idle | loading | authenticated | guest
  isBootstrapped: false,

  isAuthenticated: () => Boolean(get().user),
  isAdmin: () => get().user?.role === "admin",
  isStaff: () => ["admin", "staff"].includes(get().user?.role),

  setUser: (user) => set({ user, status: user ? "authenticated" : "guest" }),

  /**
   * Khoi phuc phien khi tai lai trang: doi refresh cookie lay access token moi.
   * Chay mot lan o App level.
   */
  bootstrap: async () => {
    if (get().isBootstrapped) return undefined;
    if (bootstrapPromise) return bootstrapPromise;

    // Khach chua tung dang nhap tren may nay: bo qua, khong goi API
    if (!hasSessionHint()) {
      setAccessToken(null);
      set({ user: null, status: "guest", isBootstrapped: true });
      return undefined;
    }

    set({ status: "loading" });
    bootstrapPromise = (async () => {
      try {
        const res = await authApi.refresh();
        setAccessToken(res.data.accessToken);
        setSessionHint(true);
        set({ user: res.data.user, status: "authenticated" });
      } catch {
        setAccessToken(null);
        setSessionHint(false);
        set({ user: null, status: "guest" });
      } finally {
        set({ isBootstrapped: true });
        bootstrapPromise = null;
      }
    })();

    return bootstrapPromise;
  },

  login: async (credentials, guestCart = []) => {
    const res = await authApi.login({ ...credentials, guestCart });
    setAccessToken(res.data.accessToken);
    setSessionHint(true);
    set({ user: res.data.user, status: "authenticated", isBootstrapped: true });
    return res.data.user;
  },

  register: async (payload) => {
    const res = await authApi.register(payload);
    setAccessToken(res.data.accessToken);
    setSessionHint(true);
    set({ user: res.data.user, status: "authenticated", isBootstrapped: true });
    return res.data.user;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      /* van dang xuat o client du API loi */
    }
    setAccessToken(null);
    setSessionHint(false);
    set({ user: null, status: "guest" });
  },

  refreshProfile: async () => {
    const res = await authApi.me();
    set({ user: res.data });
    return res.data;
  },

  /** Cap nhat cuc bo sau khi doi ho so / wishlist */
  patchUser: (patch) => set((state) => ({ user: state.user ? { ...state.user, ...patch } : null })),
}));

// Khi refresh token cung het han -> dua ve trang thai khach
setUnauthorizedHandler(() => {
  setSessionHint(false);
  useAuthStore.setState({ user: null, status: "guest" });
});

export default useAuthStore;
