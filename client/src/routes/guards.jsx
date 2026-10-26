import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks";
import { PageLoader } from "@/components/common";

/** Chan route can dang nhap, giu lai duong dan de quay lai sau khi dang nhap */
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/dang-nhap?redirect=${redirect}`} replace />;
  }
  return children;
};

/** Chi cho admin/staff - kiem tra o ca frontend lan backend */
export const AdminRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isStaff, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/dang-nhap?redirect=${redirect}`} replace />;
  }
  if (adminOnly ? !isAdmin : !isStaff) return <Navigate to="/" replace />;
  return children;
};

/** Da dang nhap thi khong vao lai trang dang nhap/dang ky */
export const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};
