import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Package, ArrowLeft, XCircle, CreditCard } from "@phosphor-icons/react";
import { toast } from "sonner";
import { orderApi } from "@/services/api";
import {
  cn,
  formatVND,
  formatDate,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/utils";
import { EmptyState, Loader, Pagination, ErrorState } from "@/components/common";
import { Button, ButtonCTA } from "@/components/ui/button";
import { Badge, Separator } from "@/components/ui/display";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/overlay";
import { Textarea, Field } from "@/components/ui/input";

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "processing", label: "Đang xử lý" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã giao" },
  { value: "cancelled", label: "Đã huỷ" },
];

export const StatusBadge = ({ status, className }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-editorial ring-1 ring-inset",
      ORDER_STATUS_TONE[status],
      className,
    )}
  >
    {ORDER_STATUS_LABELS[status]}
  </span>
);

/* ------------------------------ Lich su don ------------------------------ */

export const OrderHistoryPage = () => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["my-orders", status, page],
    queryFn: () => orderApi.myOrders({ status: status || undefined, page, limit: 8 }),
    placeholderData: keepPreviousData,
  });

  const orders = data?.data || [];

  return (
    <div>
      <div className="pb-7">
        <h2 className="font-display text-2xl font-normal text-ink">Đơn hàng của tôi</h2>
        <p className="mt-2 text-sm text-ink-muted">Theo dõi trạng thái và lịch sử mua hàng.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar border-b border-ink/10 pb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-[0.6875rem] uppercase tracking-wideish transition-all duration-400 ease-spring",
              status === tab.value ? "bg-ink text-bone" : "text-ink-muted hover:bg-ink/[0.05]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <ErrorState message={error?.message} onRetry={refetch} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package size={20} weight="light" />}
            title="Chưa có đơn hàng nào"
            description="Khi bạn đặt hàng, đơn sẽ xuất hiện tại đây để theo dõi."
            action={
              <ButtonCTA variant="outline" asChild>
                <Link to="/shop">Bắt đầu mua sắm</Link>
              </ButtonCTA>
            }
          />
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order._id}>
                <Link
                  to={`/tai-khoan/don-hang/${order._id}`}
                  className="group block rounded-md border border-ink/12 p-5 transition-all duration-500 ease-spring hover:border-ink/30 hover:shadow-ambient"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-ink">{order.orderCode}</span>
                      <StatusBadge status={order.orderStatus} />
                    </div>
                    <span className="text-xs text-ink-faint">{formatDate(order.createdAt, true)}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {order.items.slice(0, 4).map((item, i) => (
                        <div
                          key={i}
                          className="h-12 w-10 overflow-hidden rounded-sm border-2 border-bone bg-bone-warm"
                        >
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-ink-muted">
                      {order.items.length} sản phẩm
                      {order.items.length > 4 ? ` · +${order.items.length - 4} nữa` : ""}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-ink-faint">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod]} ·{" "}
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                    <span className="font-display text-xl tabular-nums text-ink">
                      {formatVND(order.total)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {data?.meta?.totalPages > 1 && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={setPage}
            className="mt-12"
          />
        )}
      </div>
    </div>
  );
};

/* ------------------------------ Chi tiet don ------------------------------ */

const CancelDialog = ({ orderId, onCancelled }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await orderApi.cancel(orderId, reason);
      toast.success("Đã huỷ đơn hàng");
      setOpen(false);
      onCancelled();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <XCircle size={14} weight="light" /> Huỷ đơn hàng
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Huỷ đơn hàng này?</DialogTitle>
          <DialogDescription>
            Hàng sẽ được trả lại kho và mã giảm giá (nếu có) được hoàn lượt. Thao tác không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <Field label="Lý do huỷ" hint="Không bắt buộc, nhưng giúp chúng tôi cải thiện dịch vụ">
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Giữ đơn hàng
          </Button>
          <Button variant="destructive" onClick={submit} disabled={submitting}>
            {submitting ? "Đang huỷ…" : "Xác nhận huỷ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [paying, setPaying] = useState(false);

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.detail(id),
    select: (res) => res.data,
  });

  if (isLoading) return <Loader />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const canCancel = order.orderStatus === "pending";
  const canPay = order.paymentStatus !== "paid" && order.paymentMethod !== "cod" && !["cancelled", "returned"].includes(order.orderStatus);

  const retryPayment = async () => {
    setPaying(true);
    try {
      const res = await orderApi.retryPayment(order._id, order.paymentMethod);
      if (res.data?.redirectUrl) window.location.href = res.data.redirectUrl;
      else toast.error("Không tạo được liên kết thanh toán");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div>
      <Link
        to="/tai-khoan/don-hang"
        className="link-editorial inline-flex items-center gap-2 text-ink-faint hover:text-ink"
      >
        <ArrowLeft size={12} weight="light" /> Tất cả đơn hàng
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-normal text-ink">{order.orderCode}</h2>
          <p className="mt-2 text-sm text-ink-muted">Đặt lúc {formatDate(order.createdAt, true)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={order.orderStatus} />
          <Badge variant={order.paymentStatus === "paid" ? "success" : "outline"}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
        </div>
      </div>

      {(canCancel || canPay) && (
        <div className="mt-6 flex flex-wrap gap-3">
          {canPay && (
            <Button size="sm" onClick={retryPayment} disabled={paying}>
              <CreditCard size={14} weight="light" /> {paying ? "Đang chuyển…" : "Thanh toán lại"}
            </Button>
          )}
          {canCancel && <CancelDialog orderId={order._id} onCancelled={refetch} />}
        </div>
      )}

      {/* Dong thoi gian trang thai */}
      <section className="mt-10">
        <h3 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Hành trình đơn hàng</h3>
        <ol className="mt-6 space-y-0">
          {order.statusHistory.map((entry, i) => {
            const isLast = i === order.statusHistory.length - 1;
            return (
              <li key={i} className="relative flex gap-5 pb-7 last:pb-0">
                {!isLast && <span className="absolute left-[7px] top-4 h-full w-px bg-ink/12" />}
                <span
                  className={cn(
                    "relative z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full ring-4 ring-bone",
                    isLast ? "bg-copper" : "bg-ink/20",
                  )}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{ORDER_STATUS_LABELS[entry.status]}</p>
                  {entry.note && <p className="mt-1 text-sm text-ink-muted">{entry.note}</p>}
                  <p className="mt-1 text-xs text-ink-faint">{formatDate(entry.updatedAt, true)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* San pham */}
      <section className="mt-12">
        <h3 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Sản phẩm</h3>
        <ul className="mt-5 divide-y divide-ink/[0.08]">
          {order.items.map((item, i) => (
            <li key={i} className="flex gap-4 py-5">
              <Link
                to={`/san-pham/${item.slug || ""}`}
                className="h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-bone-warm"
              >
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="flex-1">
                <p className="text-sm text-ink">{item.name}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {item.variantName || item.variantSku} × {item.quantity}
                </p>
                <p className="mt-2 text-sm tabular-nums text-ink">{formatVND(item.price)}</p>
              </div>
              <span className="text-sm font-medium tabular-nums text-ink">
                {formatVND(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tong ket + giao hang */}
      <section className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h3 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Giao tới</h3>
          <p className="mt-4 text-sm text-ink">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-ink-faint">{order.shippingAddress.phone}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
            {order.shippingAddress.province}
          </p>
          {order.note && (
            <p className="mt-4 rounded-md bg-ink/[0.035] p-3.5 text-xs leading-relaxed text-ink-muted">
              <span className="text-ink-faint">Ghi chú: </span>
              {order.note}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Thanh toán</h3>
          <dl className="mt-4 space-y-3 text-sm">
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
          <p className="mt-4 text-xs text-ink-faint">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
        </div>
      </section>
    </div>
  );
};
