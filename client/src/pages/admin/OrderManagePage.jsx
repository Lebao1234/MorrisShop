import { useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Eye } from "@phosphor-icons/react";
import { toast } from "sonner";
import { orderApi } from "@/services/api";
import {
  formatVND,
  formatDate,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/utils";
import { useDebounce } from "@/hooks";
import { Pagination } from "@/components/common";
import { AdminPageHeader } from "./AdminLayout";
import { AdminTable, AdminToolbar } from "@/components/admin/AdminTable";
import { StatusBadge } from "@/pages/account/OrderPages";
import { Badge, Separator } from "@/components/ui/display";
import { Button, ButtonCTA } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay";

/** Cac buoc chuyen trang thai hop le - phai khop voi STATUS_FLOW o server */
const STATUS_FLOW = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipping", "cancelled"],
  shipping: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

const OrderDetailDialog = ({ order, open, onOpenChange, onUpdated }) => {
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!order) return null;
  const allowed = STATUS_FLOW[order.orderStatus] || [];

  const submit = async () => {
    if (!nextStatus) return;
    setSaving(true);
    try {
      await orderApi.updateStatus(order._id, { status: nextStatus, note });
      toast.success(`Đã chuyển sang "${ORDER_STATUS_LABELS[nextStatus]}"`, {
        description: "Email thông báo đã được gửi tới khách hàng.",
      });
      setNextStatus("");
      setNote("");
      onUpdated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl">{order.orderCode}</DialogTitle>
          <DialogDescription>
            {formatDate(order.createdAt, true)} · {order.user?.name} ({order.user?.email})
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.orderStatus} />
          <Badge variant={order.paymentStatus === "paid" ? "success" : "outline"}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
          <Badge variant="muted">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Badge>
        </div>

        <Separator className="my-6" />

        <ul className="space-y-3">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-3.5">
              <div className="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{item.name}</p>
                <p className="text-xs text-ink-faint">
                  {item.variantName || item.variantSku} × {item.quantity}
                </p>
              </div>
              <span className="text-sm tabular-nums text-ink">{formatVND(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <Separator className="my-6" />

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Giao tới</p>
            <p className="mt-2 text-sm text-ink">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-ink-faint">{order.shippingAddress.phone}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
              {order.shippingAddress.street}, {order.shippingAddress.ward},{" "}
              {order.shippingAddress.district}, {order.shippingAddress.province}
            </p>
            {order.note && (
              <p className="mt-3 rounded-md bg-ink/[0.035] p-3 text-xs text-ink-muted">{order.note}</p>
            )}
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Tạm tính</dt>
              <dd className="tabular-nums">{formatVND(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Vận chuyển</dt>
              <dd className="tabular-nums">{formatVND(order.shippingFee)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-copper-dark">
                <dt>Giảm giá {order.couponCode && `(${order.couponCode})`}</dt>
                <dd className="tabular-nums">− {formatVND(order.discount)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-ink/12 pt-3">
              <dt className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Tổng</dt>
              <dd className="font-display text-xl tabular-nums">{formatVND(order.total)}</dd>
            </div>
          </dl>
        </div>

        <Separator className="my-6" />

        {allowed.length === 0 ? (
          <p className="rounded-md bg-ink/[0.035] p-4 text-sm text-ink-muted">
            Đơn hàng ở trạng thái cuối, không thể chuyển tiếp.
          </p>
        ) : (
          <div className="space-y-5">
            <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Cập nhật trạng thái</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Trạng thái mới">
                <Select value={nextStatus} onValueChange={setNextStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowed.map((status) => (
                      <SelectItem key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Ghi chú" hint="Sẽ hiển thị trong email gửi khách">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Không bắt buộc" />
              </Field>
            </div>
            <ButtonCTA onClick={submit} disabled={!nextStatus || saving}>
              {saving ? "Đang cập nhật…" : "Cập nhật & gửi email"}
            </ButtonCTA>
          </div>
        )}

        <Separator className="my-6" />

        <div>
          <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Lịch sử</p>
          <ol className="mt-4 space-y-2.5">
            {order.statusHistory.map((entry, i) => (
              <li key={i} className="flex items-baseline gap-3 text-xs">
                <span className="w-32 shrink-0 text-ink-faint">{formatDate(entry.updatedAt, true)}</span>
                <span className="text-ink">{ORDER_STATUS_LABELS[entry.status]}</span>
                {entry.note && <span className="text-ink-muted">— {entry.note}</span>}
              </li>
            ))}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const OrderManagePage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const debouncedSearch = useDebounce(search, 350);

  const params = {
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => orderApi.list(params),
    placeholderData: keepPreviousData,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const openDetail = async (order) => {
    try {
      const res = await orderApi.detail(order._id);
      setSelected(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Mã đơn",
      render: (order) => (
        <div>
          <p className="font-mono text-xs text-ink">{order.orderCode}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{formatDate(order.createdAt, true)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Khách hàng",
      render: (order) => (
        <div>
          <p className="text-sm text-ink">{order.user?.name || "—"}</p>
          <p className="text-xs text-ink-faint">{order.user?.email}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Sản phẩm",
      render: (order) => <span className="text-sm text-ink-muted">{order.items.length} món</span>,
    },
    {
      key: "total",
      header: "Tổng tiền",
      align: "right",
      render: (order) => <span className="text-sm tabular-nums text-ink">{formatVND(order.total)}</span>,
    },
    {
      key: "payment",
      header: "Thanh toán",
      render: (order) => (
        <div className="space-y-1">
          <Badge variant={order.paymentStatus === "paid" ? "success" : "outline"}>
            {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </Badge>
          <p className="text-[0.625rem] uppercase tracking-wideish text-ink-faint">
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (order) => <StatusBadge status={order.orderStatus} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (order) => (
        <Button variant="ghost" size="icon-sm" onClick={() => openDetail(order)} aria-label="Xem chi tiết">
          <Eye size={15} weight="light" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Đơn hàng"
        description="Theo dõi và cập nhật trạng thái đơn hàng. Mỗi lần đổi trạng thái sẽ gửi email cho khách."
      />

      <AdminToolbar search={search} onSearch={setSearch} placeholder="Tìm theo mã đơn hàng…">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={paymentStatus}
          onValueChange={(v) => {
            setPaymentStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Thanh toán" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi trạng thái TT</SelectItem>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={data?.data || []}
        isLoading={isLoading}
        empty={{ title: "Chưa có đơn hàng nào", description: "Đơn hàng của khách sẽ xuất hiện tại đây." }}
      />

      {data?.meta?.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-10" />
      )}

      <OrderDetailDialog
        order={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdated={refresh}
      />
    </div>
  );
};

export default OrderManagePage;
