import { Suspense, useEffect } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { PageLoader } from "@/components/common";
import { useAuth } from "@/hooks";
import { useCartStore } from "@/store/cartStore";

/** Chuyen trang: mo dan nhe, khong lam gian doan dong doc */
const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const RootLayout = () => {
  const { isAuthenticated } = useAuth();
  const fetchCart = useCartStore((s) => s.fetch);
  const resetCart = useCartStore((s) => s.resetOnLogout);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else resetCart();
  }, [isAuthenticated, fetchCart, resetCart]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-bone">
      {/* Lop nhieu co dinh - khong gan vao vung cuon */}
      <div className="grain-overlay" aria-hidden="true" />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-xs focus:uppercase focus:tracking-editorial focus:text-bone"
      >
        Bỏ qua tới nội dung chính
      </a>

      <Header />

      <main id="main" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Suspense>
      </main>

      <Footer />
      <CartDrawer />
      <ScrollRestoration />
    </div>
  );
};

export default RootLayout;
