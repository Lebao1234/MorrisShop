import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Handbag, Minus, Plus, Trash, TagSimple } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, formatVND } from "@/lib/utils";
import { couponApi } from "@/services/api";
import { useCart, useAuth } from "@/hooks";
import { SEO, EmptyState, Breadcrumb } from "@/components/common";
import { Reveal } from "@/components/common/Reveal";
import { ButtonCTA } from "@/components/ui/button";
import { Badge, Separator } from "@/components/ui/display";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";

const FREE_SHIP = 500000;
const SHIP_FEE = 30000;

export const CartPage = () => {
  const { cart, updateQuantity, remove, clear } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);

  const { data: coupons = [] } = useQuery({
    queryKey: ["public-coupons"],
    queryFn: couponApi.public,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });

  const shippingFee = cart.subtotal >= FREE_SHIP || cart.subtotal === 0 ? 0 : SHIP_FEE;
  const hasIssues = cart.items.some((i) => i.outOfStock);

  const act = async (id, fn, successMessage) => {
    setBusyId(id);
    try {
      await fn();
      if (successMessage) toast.success(successMessage);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (cart.items.length === 0) {
    return (
      <>
        <SEO title="Giỏ hàng" noIndex />
        <div className="container pt-32 md:pt-40">
          <EmptyState
            icon={<Handbag size={22} weight="light" />}
            title="Giỏ hàng đang trống"
            description="Chưa có sản phẩm nào trong giỏ. Khám phá bộ sưu tập để tìm kết cấu phù hợp với mái tóc của bạn."
            action={
              <ButtonCTA asChild>
                <Link to="/shop">Khám phá bộ sưu tập</Link>
              </ButtonCTA>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Giỏ hàng" noIndex />

      <div className="container pt-28 md:pt-36">
        <Breadcrumb items={[{ label: "Giỏ hàng" }]} />
        <h1 className="mt-7 font-display text-display-sm font-normal text-ink">Giỏ hàng của bạn</h1>
        <CheckoutSteps current={0} className="mt-10" />
      </div>

      <section className="container grid gap-12 py-14 lg:grid-cols-[1fr_22rem] lg:gap-16 lg:py-16">
        {/* Danh sach san pham */}
        <div>
          <div className="flex items-center justify-between border-b border-ink/12 pb-4">
            <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">
              {cart.totalQuantity} sản phẩm
            </p>
            <button
              type="button"
              onClick={() => act("clear", clear, "Đã xoá toàn bộ giỏ hàng")}
              className="link-editorial text-ink-faint hover:text-red-700"
            >
              Xoá tất cả
            </button>
          </div>

          <ul className="divide-y divide-ink/[0.08]">
            <AnimatePresence initial={false}>
              {cart.items.map((item) => (
                <motion.li
                  key={item._id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                  className={cn("flex gap-5 py-7", busyId === item._id && "opacity-50")}
                >
                  <Link
                    to={`/san-pham/${item.product.slug}`}
                    className="h-32 w-26 shrink-0 overflow-hidden rounded-sm bg-bone-warm sm:h-36 sm:w-28"
                  >
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            to={`/san-pham/${item.product.slug}`}
                            className="font-display text-lg text-ink transition-colors duration-300 hover:text-copper-dark"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-xs text-ink-faint">Phiên bản {item.variantName}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => act(item._id, () => remove(item._id), "Đã xoá sản phẩm")}
                          className="shrink-0 text-ink-faint transition-colors duration-300 hover:text-red-700"
                          aria-label={`Xoá ${item.product.name}`}
                        >
                          <Trash size={15} weight="light" />
                        </button>
                      </div>

                      {item.outOfStock && (
                        <Badge variant="danger" className="mt-2.5">
                          Chỉ còn {item.stock} sản phẩm
                        </Badge>
                      )}
                      {item.priceChanged && !item.outOfStock && (
                        <Badge variant="copper" className="mt-2.5">
                          Giá đã cập nhật
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-ink/12">
                        <button
                          type="button"
                          onClick={() => act(item._id, () => updateQuantity(item._id, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-30"
                          aria-label="Giảm số lượng"
                        >
                          <Minus size={12} weight="light" />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums text-ink">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => act(item._id, () => updateQuantity(item._id, item.quantity + 1))}
                          disabled={item.quantity >= item.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:opacity-30"
                          aria-label="Tăng số lượng"
                        >
                          <Plus size={12} weight="light" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-medium tabular-nums text-ink">{formatVND(item.lineTotal)}</p>
                        <p className="text-xs text-ink-faint">{formatVND(item.price)} / sản phẩm</p>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <Link to="/shop" className="link-editorial mt-8 inline-block text-ink-muted hover:text-ink">
            ← Tiếp tục mua sắm
          </Link>
        </div>

        {/* Tom tat don hang */}
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <Reveal y={20}>
            <div className="bezel">
              <div className="bezel-core p-7">
                <h2 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Tóm tắt đơn hàng</h2>

                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Tạm tính</dt>
                    <dd className="tabular-nums text-ink">{formatVND(cart.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Phí vận chuyển</dt>
                    <dd className="tabular-nums text-ink">
                      {shippingFee === 0 ? <span className="text-copper-dark">Miễn phí</span> : formatVND(shippingFee)}
                    </dd>
                  </div>
                </dl>

                <Separator className="my-5" />

                <div className="flex items-baseline justify-between">
                  <span className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Tổng cộng</span>
                  <span className="font-display text-3xl tabular-nums text-ink">
                    {formatVND(cart.subtotal + shippingFee)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-faint">Mã giảm giá được áp dụng ở bước thanh toán.</p>

                <ButtonCTA
                  size="lg"
                  className="mt-7 w-full"
                  disabled={hasIssues}
                  onClick={() =>
                    navigate(isAuthenticated ? "/thanh-toan" : "/dang-nhap?redirect=/thanh-toan")
                  }
                >
                  {hasIssues ? "Cập nhật giỏ hàng" : "Tiến hành thanh toán"}
                </ButtonCTA>

                {hasIssues && (
                  <p className="mt-3 text-center text-xs text-red-700">
                    Một số sản phẩm vượt quá tồn kho hiện có
                  </p>
                )}
              </div>
            </div>

            {/* Ma giam gia dang chay */}
            {coupons.length > 0 && (
              <div className="mt-6">
                <p className="flex items-center gap-2 text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                  <TagSimple size={13} weight="light" /> Mã đang chạy
                </p>
                <ul className="mt-4 space-y-2.5">
                  {coupons.map((coupon) => (
                    <li
                      key={coupon._id}
                      className="flex items-center justify-between gap-3 rounded-md border border-dashed border-ink/18 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs uppercase tracking-wider text-ink">{coupon.code}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-faint">{coupon.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(coupon.code);
                          toast.success(`Đã sao chép mã ${coupon.code}`);
                        }}
                        className="shrink-0 text-[0.625rem] uppercase tracking-editorial text-copper-dark transition-opacity hover:opacity-70"
                      >
                        Sao chép
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Reveal>
        </aside>
      </section>
    </>
  );
};

export default CartPage;
