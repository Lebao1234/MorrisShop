import { useEffect } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Package, XCircle } from "@phosphor-icons/react";
import { orderApi } from "@/services/api";
import { formatVND, formatDate, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/utils";
import { SEO, PageLoader } from "@/components/common";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import { Button, ButtonCTA } from "@/components/ui/button";
import { Badge, Separator } from "@/components/ui/display";
import { useCartStore } from "@/store/cartStore";

/** Trang hien sau khi dat hang thanh cong hoac quay ve tu cong thanh toan */
export const OrderSuccessPage = () => {
  const { orderCode } = useParams();
  const location = useLocation();
  const clearGuestCart = useCartStore((s) => s.clear);

  // Don vua dat duoc truyen qua router state de hien ngay, sau do lam moi tu server
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderCode],
    queryFn: () => orderApi.detail(orderCode),
    select: (res) => res.data,
    placeholderData: location.state?.order ? { data: location.state.order } : undefined,
  });

  useEffect(() => {
    clearGuestCart().catch(() => {});
  }, [clearGuestCart]);

  if (isLoading && !order) return <PageLoader />;
  if (!order) return null;

  const paid = order.paymentStatus === "paid";

  return (
    <>
      <SEO title={`Đơn hàng ${order.orderCode}`} noIndex />

      <div className="container pt-28 md:pt-36">
        <CheckoutSteps current={3} />
      </div>

      <section className="container py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-copper text-white"
          >
            <Check size={26} weight="light" />
          </motion.div>

          <h1 className="mt-8 font-display text-display-sm font-normal text-ink">Cảm ơn bạn đã đặt hàng</h1>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-muted">
            Đơn hàng <span className="font-mono text-ink">{order.orderCode}</span> đã được ghi nhận. Chúng
            tôi sẽ liên hệ xác nhận trong vòng 24 giờ và gửi email cập nhật ở mỗi bước.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="mx-auto mt-14 max-w-2xl bezel"
        >
          <div className="bezel-core p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Mã đơn hàng</p>
                <p className="mt-1.5 font-mono text-lg text-ink">{order.orderCode}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Đặt lúc</p>
                <p className="mt-1.5 text-sm text-ink">{formatDate(order.createdAt, true)}</p>
              </div>
            </div>

            <Separator className="my-7" />

            <ul className="space-y-4">
              {order.items.map((item) => (
                <li key={item.variantSku} className="flex gap-4">
                  <div className="relative h-18 w-14 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">{item.name}</p>
                    <p className="text-xs text-ink-faint">
                      {item.variantName} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums text-ink">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-7" />

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Tạm tính</dt>
                <dd className="tabular-nums text-ink">{formatVND(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-muted">Phí vận chuyển</dt>
                <dd className="tabular-nums text-ink">
                  {order.shippingFee === 0 ? (
                    <span className="text-copper-dark">Miễn phí</span>
                  ) : (
                    formatVND(order.shippingFee)
                  )}
                </dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-copper-dark">
                  <dt>Giảm giá {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                  <dd className="tabular-nums">− {formatVND(order.discount)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-ink/12 pt-4">
                <dt className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Tổng cộng</dt>
                <dd className="font-display text-2xl tabular-nums text-ink">{formatVND(order.total)}</dd>
              </div>
            </dl>

            <Separator className="my-7" />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Giao tới</p>
                <p className="mt-2 text-sm text-ink">{order.shippingAddress.fullName}</p>
                <p className="text-xs text-ink-faint">{order.shippingAddress.phone}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                  {order.shippingAddress.street}, {order.shippingAddress.ward},{" "}
                  {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </div>
              <div>
                <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Thanh toán</p>
                <p className="mt-2 text-sm text-ink">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                <Badge variant={paid ? "success" : "outline"} className="mt-2">
                  {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-4">
          <ButtonCTA asChild>
            <Link to={`/tai-khoan/don-hang/${order._id}`}>Theo dõi đơn hàng</Link>
          </ButtonCTA>
          <Button variant="outline" asChild>
            <Link to="/shop">Tiếp tục mua sắm</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

/* ------------------------- Trang tra ve tu VNPay ------------------------- */

export const VnpayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const clearGuestCart = useCartStore((s) => s.clear);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["vnpay-return", searchParams.toString()],
    queryFn: () => orderApi.vnpayReturn(searchParams.toString()),
    select: (res) => res.data,
    retry: false,
  });

  useEffect(() => {
    if (data?.success) clearGuestCart().catch(() => {});
  }, [data?.success, clearGuestCart]);

  if (isLoading) return <PageLoader />;

  const success = data?.success;

  return (
    <>
      <SEO title="Kết quả thanh toán" noIndex />
      <section className="container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ${
            success ? "bg-copper text-white" : "bg-red-700/10 text-red-700"
          }`}
        >
          {success ? <Check size={26} weight="light" /> : <XCircle size={26} weight="light" />}
        </div>

        <h1 className="mt-8 font-display text-display-sm font-normal text-ink">
          {success ? "Thanh toán thành công" : "Thanh toán không thành công"}
        </h1>
        <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
          {isError
            ? error?.message
            : success
              ? `Đơn hàng ${data?.order?.orderCode} đã được thanh toán và chuyển sang trạng thái đã xác nhận.`
              : "Giao dịch bị huỷ hoặc thất bại. Đơn hàng của bạn vẫn được giữ, bạn có thể thanh toán lại từ trang chi tiết đơn."}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {data?.order && (
            <ButtonCTA asChild>
              <Link to={`/tai-khoan/don-hang/${data.order._id}`}>
                <Package size={14} weight="light" className="mr-1" /> Xem đơn hàng
              </Link>
            </ButtonCTA>
          )}
          <Button variant="outline" asChild>
            <Link to="/shop">Về cửa hàng</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default OrderSuccessPage;
