import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Handbag, Minus, Plus, Trash, Truck } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, formatVND } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/overlay";
import { Button, ButtonCTA } from "@/components/ui/button";
import { useCart, useAuth } from "@/hooks";

const FREE_SHIP_THRESHOLD = 500000;

const QuantityStepper = ({ value, min = 1, max = 99, onChange, disabled }) => (
  <div className="inline-flex items-center rounded-full border border-ink/12">
    <button
      type="button"
      onClick={() => onChange(value - 1)}
      disabled={disabled || value <= min - 1}
      className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors duration-300 hover:bg-ink/[0.06] hover:text-ink disabled:opacity-30"
      aria-label="Giảm số lượng"
    >
      <Minus size={11} weight="light" />
    </button>
    <span className="w-7 text-center text-xs tabular-nums text-ink">{value}</span>
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      disabled={disabled || value >= max}
      className="flex h-7 w-7 items-center justify-center rounded-full text-ink-muted transition-colors duration-300 hover:bg-ink/[0.06] hover:text-ink disabled:opacity-30"
      aria-label="Tăng số lượng"
    >
      <Plus size={11} weight="light" />
    </button>
  </div>
);

/** Thanh tien trinh toi nguong mien phi van chuyen */
const FreeShipMeter = ({ subtotal }) => {
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const percent = Math.min(100, (subtotal / FREE_SHIP_THRESHOLD) * 100);

  return (
    <div className="space-y-2.5 border-b border-ink/10 px-6 py-5">
      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Truck size={15} weight="light" className="text-copper" />
        {remaining > 0 ? (
          <span>
            Mua thêm <strong className="font-medium text-ink">{formatVND(remaining)}</strong> để được miễn
            phí vận chuyển
          </span>
        ) : (
          <span className="text-copper-dark">Đơn hàng của bạn được miễn phí vận chuyển</span>
        )}
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full bg-copper"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>
    </div>
  );
};

export const CartDrawer = () => {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, remove } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);

  const handleQuantity = async (itemId, quantity) => {
    setBusyId(itemId);
    try {
      await updateQuantity(itemId, quantity);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (itemId, name) => {
    setBusyId(itemId);
    try {
      await remove(itemId);
      toast.success(`Đã xoá ${name}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const goToCheckout = () => {
    closeDrawer();
    navigate(isAuthenticated ? "/thanh-toan" : "/dang-nhap?redirect=/thanh-toan");
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="right" className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="text-[0.6875rem] font-medium uppercase tracking-editorial text-ink">
            Giỏ hàng{cart.totalQuantity > 0 ? ` (${cart.totalQuantity})` : ""}
          </h2>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-ink/[0.045]">
              <Handbag size={22} weight="light" className="text-ink-faint" />
            </div>
            <p className="font-display text-2xl text-ink">Giỏ hàng đang trống</p>
            <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
              Chưa có sản phẩm nào. Khám phá bộ sưu tập để tìm kết cấu phù hợp với mái tóc của bạn.
            </p>
            <ButtonCTA className="mt-8" onClick={closeDrawer} asChild>
              <Link to="/shop">Khám phá bộ sưu tập</Link>
            </ButtonCTA>
          </div>
        ) : (
          <>
            <FreeShipMeter subtotal={cart.subtotal} />

            <ul className="flex-1 divide-y divide-ink/[0.07] overflow-y-auto px-6">
              <AnimatePresence initial={false}>
                {cart.items.map((item) => (
                  <motion.li
                    key={item._id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                    className={cn("flex gap-4 py-5", busyId === item._id && "opacity-50")}
                  >
                    <Link
                      to={`/san-pham/${item.product.slug}`}
                      onClick={closeDrawer}
                      className="h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-bone-warm"
                    >
                      <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/san-pham/${item.product.slug}`}
                            onClick={closeDrawer}
                            className="font-display text-base leading-snug text-ink transition-colors duration-300 hover:text-copper-dark"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemove(item._id, item.product.name)}
                            className="shrink-0 text-ink-faint transition-colors duration-300 hover:text-red-700"
                            aria-label={`Xoá ${item.product.name}`}
                          >
                            <Trash size={14} weight="light" />
                          </button>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-faint">{item.variantName}</p>
                        {item.outOfStock && (
                          <p className="mt-1 text-xs text-red-700">Chỉ còn {item.stock} sản phẩm</p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <QuantityStepper
                          value={item.quantity}
                          max={item.stock}
                          onChange={(q) => handleQuantity(item._id, q)}
                          disabled={busyId === item._id}
                        />
                        <span className="text-sm font-medium tabular-nums text-ink">
                          {formatVND(item.lineTotal)}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <div className="border-t border-ink/10 bg-bone-warm/60 px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[0.6875rem] uppercase tracking-editorial text-ink-faint">Tạm tính</span>
                <span className="font-display text-2xl tabular-nums text-ink">{formatVND(cart.subtotal)}</span>
              </div>
              <p className="mt-1.5 text-xs text-ink-faint">
                Phí vận chuyển và mã giảm giá được tính ở bước thanh toán.
              </p>

              <ButtonCTA className="mt-6 w-full" onClick={goToCheckout}>
                Tiến hành thanh toán
              </ButtonCTA>
              <Button variant="ghost" className="mt-2 w-full" onClick={closeDrawer} asChild>
                <Link to="/gio-hang">Xem giỏ hàng chi tiết</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
