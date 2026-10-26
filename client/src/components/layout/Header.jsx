import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlass, Handbag, User, SignOut, Package, Heart, Gauge } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useAuth, useCart, useScrolledPast, useLockBody } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/overlay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/display";
import { initials } from "@/lib/utils";
import SearchOverlay from "./SearchOverlay";

const NAV_LINKS = [
  { to: "/shop", label: "Cửa hàng" },
  { to: "/shop?category=sap-vuot-toc", label: "Sáp vuốt tóc" },
  { to: "/shop?category=combo-cham-soc", label: "Combo" },
  { to: "/about", label: "Câu chuyện" },
];

/* ------------------------- Hamburger bien hinh chu X ------------------------ */

const HamburgerMorph = ({ open, onClick, className }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={open ? "Đóng menu" : "Mở menu"}
    aria-expanded={open}
    className={cn("relative flex h-10 w-10 items-center justify-center", className)}
  >
    <span className="relative block h-3 w-5">
      <span
        className={cn(
          "absolute left-0 block h-px w-full bg-current transition-all duration-500 ease-spring",
          open ? "top-1.5 rotate-45" : "top-0 rotate-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 block h-px bg-current transition-all duration-500 ease-spring",
          open ? "top-1.5 w-full -rotate-45" : "top-3 w-3/4 rotate-0",
        )}
      />
    </span>
  </button>
);

/* --------------------------- Menu toan man hinh --------------------------- */

const FullscreenMenu = ({ open, onClose }) => {
  const { user, isStaff } = useAuth();
  useLockBody(open);

  // Phim Escape phai dong duoc menu - neu khong, lop phu se chan moi thao tac khac
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[60] bg-bone/92 backdrop-blur-3xl"
        >
          <div className="flex h-full flex-col px-6 pb-12 pt-28 md:px-14">
            <nav className="flex-1">
              <ul className="space-y-2">
                {NAV_LINKS.map((link, i) => (
                  <li key={link.to} className="overflow-hidden">
                    <motion.div
                      initial={{ y: "110%", opacity: 0 }}
                      animate={{ y: "0%", opacity: 1 }}
                      exit={{ y: "60%", opacity: 0 }}
                      transition={{
                        duration: 0.75,
                        delay: 0.08 + i * 0.055,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        to={link.to}
                        onClick={onClose}
                        className="group flex items-baseline gap-5 py-2 font-display text-[clamp(2.5rem,9vw,5rem)] font-normal leading-[1.05] text-ink transition-colors duration-500 hover:text-copper-dark"
                      >
                        <span className="text-[0.625rem] tabular-nums tracking-editorial text-ink-faint">
                          0{i + 1}
                        </span>
                        {link.label}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.34, ease: [0.32, 0.72, 0, 1] }}
              className="hairline flex flex-wrap items-center justify-between gap-6 pt-8"
            >
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                <Link to={user ? "/tai-khoan" : "/dang-nhap"} onClick={onClose} className="link-editorial text-ink-muted">
                  {user ? "Tài khoản" : "Đăng nhập"}
                </Link>
                <Link to="/tai-khoan/don-hang" onClick={onClose} className="link-editorial text-ink-muted">
                  Đơn hàng
                </Link>
                <Link to="/tai-khoan/yeu-thich" onClick={onClose} className="link-editorial text-ink-muted">
                  Yêu thích
                </Link>
                {isStaff && (
                  <Link to="/admin" onClick={onClose} className="link-editorial text-copper-dark">
                    Quản trị
                  </Link>
                )}
              </div>
              <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                Hà Nội — Việt Nam
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* --------------------------------- Header --------------------------------- */

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrolled = useScrolledPast(40);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isStaff } = useAuth();
  const { cart, openDrawer } = useCart();
  const logout = useAuthStore((s) => s.logout);

  // Dong menu khi doi trang
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  /*
   * Trang chu co hero anh toi tran vien. Khi header con trong suot o dinh trang,
   * chu mau muc se chim vao anh, nen doi sang mau sang. Cuon xuong (hoac mo menu)
   * header tro thanh vien tron mau bone va chu quay lai mau muc.
   */
  const overHero = location.pathname === "/" && !scrolled && !menuOpen;

  const iconButton = cn(
    "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-400 ease-spring",
    overHero ? "text-bone hover:bg-bone/12" : "text-ink hover:bg-ink/[0.07]",
  );

  return (
    <>
      {/* Thanh dieu huong dang vien tron noi, tach khoi mep tren */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:pt-6">
        <motion.div
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            "pointer-events-auto mx-auto flex items-center gap-2 rounded-full px-2.5 py-2 transition-all duration-700 ease-spring md:gap-6 md:px-4",
            "max-w-[min(72rem,100%)]",
            scrolled || menuOpen
              ? "bg-bone/85 shadow-ambient ring-1 ring-inset ring-ink/[0.07] backdrop-blur-xl"
              : "bg-transparent ring-1 ring-inset ring-transparent",
          )}
        >
          <HamburgerMorph
            open={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={cn("md:hidden", overHero ? "text-bone" : "text-ink")}
          />

          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 px-2 font-display text-lg font-normal tracking-[0.32em] transition-colors duration-500 md:px-1",
              overHero ? "text-bone" : "text-ink",
            )}
            aria-label="Morris - trang chủ"
          >
            MORRIS
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "link-editorial transition-colors duration-400",
                    overHero ? "text-bone/75 hover:text-bone" : "text-ink-muted hover:text-ink",
                    isActive && location.search === (link.to.split("?")[1] ? `?${link.to.split("?")[1]}` : "")
                      ? overHero
                        ? "text-bone"
                        : "text-ink"
                      : "",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={iconButton}
              aria-label="Tìm kiếm sản phẩm"
            >
              <MagnifyingGlass size={17} weight="light" />
            </button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={iconButton} aria-label="Tài khoản của tôi">
                    <Avatar className="h-7 w-7">
                      {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/tai-khoan">
                      <User size={15} weight="light" /> Hồ sơ của tôi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tai-khoan/don-hang">
                      <Package size={15} weight="light" /> Đơn hàng
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tai-khoan/yeu-thich">
                      <Heart size={15} weight="light" /> Yêu thích
                    </Link>
                  </DropdownMenuItem>
                  {isStaff && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Gauge size={15} weight="light" /> Trang quản trị
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <SignOut size={15} weight="light" /> Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/dang-nhap" className={iconButton} aria-label="Đăng nhập">
                <User size={17} weight="light" />
              </Link>
            )}

            <button
              type="button"
              onClick={openDrawer}
              className={cn(iconButton, "relative")}
              aria-label={`Giỏ hàng, ${cart.totalQuantity} sản phẩm`}
            >
              <Handbag size={17} weight="light" />
              <AnimatePresence>
                {cart.totalQuantity > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-copper px-1 text-[0.5625rem] font-medium tabular-nums text-white"
                  >
                    {cart.totalQuantity}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <HamburgerMorph
              open={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={cn("hidden md:flex", overHero ? "text-bone" : "text-ink")}
            />
          </div>
        </motion.div>
      </header>

      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Header;
