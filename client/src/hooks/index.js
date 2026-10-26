import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, buildGuestCart } from "@/store/cartStore";

/** Tra ve gia tri sau khi ngung thay doi trong `delay` ms */
export const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  return {
    user,
    status,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    isStaff: ["admin", "staff"].includes(user?.role),
    isLoading: status === "loading" || status === "idle",
  };
};

/**
 * Chon tung lat cat nguyen thuy tu store roi memo hoa gio hang dan xuat.
 * Khong tinh object dan xuat ngay trong selector: zustand se coi moi lan
 * render la mot snapshot moi va gay vong lap cap nhat vo han.
 */
export const useCart = () => {
  const server = useCartStore((s) => s.server);
  const guestItems = useCartStore((s) => s.guestItems);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const isLoading = useCartStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  const cart = useMemo(
    () => (user ? server : buildGuestCart(guestItems)),
    [user, server, guestItems],
  );

  // Cac action cua zustand khong doi identity nen lay mot lan la du
  const actions = useRef(null);
  if (!actions.current) {
    const s = useCartStore.getState();
    actions.current = {
      openDrawer: s.openDrawer,
      closeDrawer: s.closeDrawer,
      toggleDrawer: s.toggleDrawer,
      fetch: s.fetch,
      add: s.add,
      updateQuantity: s.updateQuantity,
      remove: s.remove,
      clear: s.clear,
      syncAfterLogin: s.syncAfterLogin,
      resetOnLogout: s.resetOnLogout,
      guestPayload: s.guestPayload,
    };
  }

  return { cart, isDrawerOpen, isLoading, ...actions.current };
};

/** Theo doi media query, khong dung listener scroll */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
};

/** Bao trang da cuon qua nguong - dung IntersectionObserver thay vi scroll listener */
export const useScrolledPast = (threshold = 24) => {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = `position:absolute;top:${threshold}px;height:1px;width:1px;pointer-events:none;`;
    document.body.prepend(sentinel);
    sentinelRef.current = sentinel;

    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [threshold]);

  return scrolled;
};

/** Khoa cuon trang khi mo overlay */
export const useLockBody = (locked) => {
  useEffect(() => {
    if (!locked) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
};

/**
 * Dong bo bo loc voi query string cua URL - de chia se link va dung nut back.
 */
export const useFilterParams = (defaults = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const obj = { ...defaults };
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }, [searchParams, defaults]);

  const setFilters = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) {
          next.delete(key);
        } else {
          next.set(key, Array.isArray(value) ? value.join(",") : String(value));
        }
      });
      if (resetPage && !("page" in patch)) next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  return { filters, setFilters, clearFilters, searchParams };
};

/** Luu tru cuc bo an toan (bat loi quota / che do rieng tu) */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* bo qua khi khong ghi duoc */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
};

/** Toa do con tro tuong doi trong phan tu, dung cho hieu ung zoom anh */
export const usePointerPosition = () => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const onPointerMove = useCallback((event) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return { ref, position, onPointerMove };
};
