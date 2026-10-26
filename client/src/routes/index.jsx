import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "@/components/layout/RootLayout";
import Home from "@/pages/Home";
import NotFoundPage from "@/pages/NotFoundPage";
import { PrivateRoute, AdminRoute, GuestRoute } from "./guards";

/*
 * Dung `lazy` cua React Router thay vi React.lazy: module duoc tai xong roi
 * moi render route, nen khong co component nao "suspend" giua mot cap nhat
 * dong bo - loi bo cuc nhay sang mang hinh loading duoc loai bo hoan toan.
 */
const route = (loader, { name = "default", guard: Guard, guardProps } = {}) =>
  async () => {
    const mod = await loader();
    const Component = mod[name];
    if (!Guard) return { Component };
    return {
      Component: (props) => (
        <Guard {...guardProps}>
          <Component {...props} />
        </Guard>
      ),
    };
  };

const loadShop = () => import("@/pages/ShopPage");
const loadProduct = () => import("@/pages/ProductDetailPage");
const loadAbout = () => import("@/pages/AboutPage");
const loadCart = () => import("@/pages/CartPage");
const loadCheckout = () => import("@/pages/CheckoutPage");
const loadAuth = () => import("@/pages/AuthPages");
const loadOrderSuccess = () => import("@/pages/OrderSuccessPage");
const loadAccountLayout = () => import("@/pages/account/AccountLayout");
const loadAccount = () => import("@/pages/account/AccountPages");
const loadOrders = () => import("@/pages/account/OrderPages");
const loadAdminLayout = () => import("@/pages/admin/AdminLayout");
const loadDashboard = () => import("@/pages/admin/DashboardPage");
const loadAdminProducts = () => import("@/pages/admin/ProductManagePage");
const loadAdminOrders = () => import("@/pages/admin/OrderManagePage");
const loadAdminUsers = () => import("@/pages/admin/UserManagePage");
const loadAdminCatalog = () => import("@/pages/admin/CatalogManagePages");

const routes = [
  /* --------------------------- Khu vuc cua hang --------------------------- */
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "shop", lazy: route(loadShop) },
      { path: "san-pham/:slug", lazy: route(loadProduct) },
      { path: "about", lazy: route(loadAbout) },
      { path: "gio-hang", lazy: route(loadCart) },
      { path: "thanh-toan", lazy: route(loadCheckout, { guard: PrivateRoute }) },
      {
        path: "dat-hang-thanh-cong/:orderCode",
        lazy: route(loadOrderSuccess, { name: "OrderSuccessPage", guard: PrivateRoute }),
      },
      {
        path: "checkout/vnpay-return",
        lazy: route(loadOrderSuccess, { name: "VnpayReturnPage" }),
      },

      /* ----------------------------- Tai khoan ----------------------------- */
      {
        path: "tai-khoan",
        lazy: route(loadAccountLayout, { guard: PrivateRoute }),
        children: [
          { index: true, lazy: route(loadAccount, { name: "ProfilePage" }) },
          { path: "don-hang", lazy: route(loadOrders, { name: "OrderHistoryPage" }) },
          { path: "don-hang/:id", lazy: route(loadOrders, { name: "OrderDetailPage" }) },
          { path: "dia-chi", lazy: route(loadAccount, { name: "AddressesPage" }) },
          { path: "yeu-thich", lazy: route(loadAccount, { name: "WishlistPage" }) },
          { path: "bao-mat", lazy: route(loadAccount, { name: "SecurityPage" }) },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },

  /* ------------------------------ Xac thuc ------------------------------ */
  { path: "/dang-nhap", lazy: route(loadAuth, { name: "LoginPage", guard: GuestRoute }) },
  { path: "/dang-ky", lazy: route(loadAuth, { name: "RegisterPage", guard: GuestRoute }) },
  { path: "/quen-mat-khau", lazy: route(loadAuth, { name: "ForgotPasswordPage" }) },
  { path: "/reset-password", lazy: route(loadAuth, { name: "ResetPasswordPage" }) },

  /* -------------------------------- Admin -------------------------------- */
  {
    path: "/admin",
    lazy: route(loadAdminLayout, { guard: AdminRoute }),
    children: [
      { index: true, lazy: route(loadDashboard) },
      { path: "don-hang", lazy: route(loadAdminOrders) },
      { path: "san-pham", lazy: route(loadAdminProducts) },
      { path: "danh-gia", lazy: route(loadAdminCatalog, { name: "ReviewManagePage" }) },
      {
        path: "danh-muc",
        lazy: route(loadAdminCatalog, {
          name: "CategoryManagePage",
          guard: AdminRoute,
          guardProps: { adminOnly: true },
        }),
      },
      {
        path: "ma-giam-gia",
        lazy: route(loadAdminCatalog, {
          name: "CouponManagePage",
          guard: AdminRoute,
          guardProps: { adminOnly: true },
        }),
      },
      {
        path: "banner",
        lazy: route(loadAdminCatalog, {
          name: "BannerManagePage",
          guard: AdminRoute,
          guardProps: { adminOnly: true },
        }),
      },
      {
        path: "nguoi-dung",
        lazy: route(loadAdminUsers, { guard: AdminRoute, guardProps: { adminOnly: true } }),
      },
      { path: "*", element: <Navigate to="/admin" replace /> },
    ],
  },
];

export const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export default router;
