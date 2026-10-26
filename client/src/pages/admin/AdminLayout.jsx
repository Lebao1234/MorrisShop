import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Gauge,
  Package,
  SquaresFour,
  Receipt,
  Users,
  TagSimple,
  Image as ImageIcon,
  ChatCircle,
  SignOut,
  List,
  X,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { SEO } from "@/components/common";
import { Avatar, AvatarFallback, Badge } from "@/components/ui/display";

const NAV = [
  { to: "/admin", label: "Tổng quan", Icon: Gauge, end: true, roles: ["admin", "staff"] },
  { to: "/admin/don-hang", label: "Đơn hàng", Icon: Receipt, roles: ["admin", "staff"] },
  { to: "/admin/san-pham", label: "Sản phẩm", Icon: Package, roles: ["admin", "staff"] },
  { to: "/admin/danh-muc", label: "Danh mục", Icon: SquaresFour, roles: ["admin"] },
  { to: "/admin/danh-gia", label: "Đánh giá", Icon: ChatCircle, roles: ["admin", "staff"] },
  { to: "/admin/ma-giam-gia", label: "Mã giảm giá", Icon: TagSimple, roles: ["admin"] },
  { to: "/admin/banner", label: "Nội dung trang chủ", Icon: ImageIcon, roles: ["admin"] },
  { to: "/admin/nguoi-dung", label: "Người dùng", Icon: Users, roles: ["admin"] },
];

const SidebarContent = ({ user, onNavigate, onLogout }) => (
  <>
    <div className="px-6 py-7">
      <Link to="/" className="font-display text-lg font-normal tracking-[0.32em] text-bone">
        MORRIS
      </Link>
      <p className="mt-1.5 text-[0.625rem] uppercase tracking-editorial text-bone/40">Bảng điều khiển</p>
    </div>

    <nav className="flex-1 overflow-y-auto px-3">
      <ul className="space-y-0.5">
        {NAV.filter((item) => item.roles.includes(user?.role)).map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm transition-all duration-400 ease-spring",
                  isActive ? "bg-bone/10 text-bone" : "text-bone/55 hover:bg-bone/[0.06] hover:text-bone",
                )
              }
            >
              <Icon size={16} weight="light" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>

    <div className="border-t border-bone/10 p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-bone/12 text-bone">{initials(user?.name || "")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-bone">{user?.name}</p>
          <Badge variant="outline" className="mt-1 border-bone/20 text-bone/50">
            {user?.role === "admin" ? "Quản trị viên" : "Nhân viên"}
          </Badge>
        </div>
      </div>

      <Link
        to="/"
        className="mt-2 flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm text-bone/55 transition-colors duration-400 hover:bg-bone/[0.06] hover:text-bone"
      >
        <ArrowSquareOut size={15} weight="light" />
        Xem cửa hàng
      </Link>
      <button
        type="button"
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 text-sm text-bone/55 transition-colors duration-400 hover:bg-red-500/10 hover:text-red-300"
      >
        <SignOut size={15} weight="light" />
        Đăng xuất
      </button>
    </div>
  </>
);

export const AdminLayout = () => {
  const { user } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <SEO title="Quản trị" noIndex />

      <div className="flex min-h-[100dvh] bg-bone">
        {/* Sidebar co dinh tren desktop */}
        <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col bg-ink lg:flex">
          <SidebarContent user={user} onLogout={handleLogout} />
        </aside>

        {/* Sidebar dang overlay tren mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-label="Đóng menu"
            />
            <aside className="relative flex h-full w-72 flex-col bg-ink">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-4 top-6 text-bone/60"
                aria-label="Đóng menu"
              >
                <X size={18} weight="light" />
              </button>
              <SidebarContent
                user={user}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </aside>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Thanh dieu huong mobile */}
          <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink/10 bg-bone/90 px-4 py-3 backdrop-blur-xl lg:hidden">
            <button type="button" onClick={() => setMobileOpen(true)} aria-label="Mở menu">
              <List size={20} weight="light" />
            </button>
            <span className="font-display text-base tracking-[0.28em]">MORRIS</span>
          </div>

          <main className="px-5 py-8 md:px-8 md:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

/** Tieu de chung cho cac trang admin */
export const AdminPageHeader = ({ title, description, action, className }) => (
  <div className={cn("flex flex-wrap items-end justify-between gap-4 pb-8", className)}>
    <div>
      <h1 className="font-display text-3xl font-normal text-ink">{title}</h1>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
    </div>
    {action}
  </div>
);

export default AdminLayout;
