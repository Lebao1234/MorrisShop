import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { User, Package, Heart, MapPin, SignOut, Lock } from "@phosphor-icons/react";
import { cn, initials } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { SEO } from "@/components/common";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display";

const NAV = [
  { to: "/tai-khoan", label: "Hồ sơ", Icon: User, end: true },
  { to: "/tai-khoan/don-hang", label: "Đơn hàng", Icon: Package },
  { to: "/tai-khoan/dia-chi", label: "Sổ địa chỉ", Icon: MapPin },
  { to: "/tai-khoan/yeu-thich", label: "Yêu thích", Icon: Heart },
  { to: "/tai-khoan/bao-mat", label: "Bảo mật", Icon: Lock },
];

export const AccountLayout = () => {
  const { user } = useAuth();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <SEO title="Tài khoản của tôi" noIndex />

      <div className="container pb-24 pt-28 md:pb-30 md:pt-36">
        <header className="flex flex-wrap items-center gap-5 border-b border-ink/10 pb-10">
          <Avatar className="h-14 w-14">
            {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="text-xs">{initials(user?.name || "")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Tài khoản</p>
            <h1 className="mt-1.5 font-display text-3xl font-normal text-ink">{user?.name}</h1>
            <p className="mt-1 text-sm text-ink-muted">{user?.email}</p>
          </div>
        </header>

        <div className="grid gap-10 pt-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          {/* Dieu huong - cuon ngang tren mobile */}
          <nav className="lg:sticky lg:top-28 lg:h-fit">
            <ul className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col lg:gap-0.5">
              {NAV.map(({ to, label, Icon, end }) => (
                <li key={to} className="shrink-0">
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-sm transition-all duration-400 ease-spring lg:rounded-md",
                        isActive ? "bg-ink text-bone" : "text-ink-muted hover:bg-ink/[0.05] hover:text-ink",
                      )
                    }
                  >
                    <Icon size={15} weight="light" />
                    {label}
                  </NavLink>
                </li>
              ))}
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-sm text-ink-muted transition-all duration-400 ease-spring hover:bg-red-700/8 hover:text-red-700 lg:rounded-md"
                >
                  <SignOut size={15} weight="light" />
                  Đăng xuất
                </button>
              </li>
            </ul>
          </nav>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountLayout;
