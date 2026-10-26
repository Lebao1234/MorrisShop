import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Receipt, CurrencyCircleDollar, Users, Warning, TrendUp } from "@phosphor-icons/react";
import { dashboardApi, productApi } from "@/services/api";
import { cn, formatVND, formatNumber, ORDER_STATUS_LABELS } from "@/lib/utils";
import { Loader, ErrorState } from "@/components/common";
import { AdminPageHeader } from "./AdminLayout";
import { Badge } from "@/components/ui/display";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/controls";

const RANGES = [
  { value: "7", label: "7 ngày qua" },
  { value: "30", label: "30 ngày qua" },
  { value: "90", label: "90 ngày qua" },
  { value: "365", label: "1 năm qua" },
];

/** Mau bieu do - trung tinh + mot mau nhan, giu dung ngon ngu thuong hieu */
const CHART = {
  line: "#B08D57",
  fillFrom: "rgba(176,141,87,0.28)",
  fillTo: "rgba(176,141,87,0)",
  grid: "rgba(11,11,11,0.07)",
  axis: "#6E6A5F",
  bars: ["#0B0B0B", "#3A3831", "#B08D57", "#8E6F41", "#4A5340", "#6E6A5F", "#C9A97A"],
};

const StatCard = ({ Icon, label, value, sub, tone = "default" }) => (
  <div className="bezel">
    <div className="bezel-core p-6">
      <div className="flex items-start justify-between">
        <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">{label}</p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            tone === "warn" ? "bg-red-700/10 text-red-700" : "bg-ink/[0.05] text-copper-dark",
          )}
        >
          <Icon size={16} weight="light" />
        </span>
      </div>
      <p className="mt-5 font-display text-3xl tabular-nums text-ink">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-ink-faint">{sub}</p>}
    </div>
  </div>
);

const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-ink/10 bg-white px-4 py-3 shadow-ambient">
      <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="mt-1.5 text-sm tabular-nums text-ink">
          {formatter ? formatter(entry.value, entry.dataKey) : entry.value}
        </p>
      ))}
    </div>
  );
};

export const DashboardPage = () => {
  const [days, setDays] = useState("30");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => dashboardApi.stats(Number(days)),
    select: (res) => res.data,
  });

  const { data: lowStock } = useQuery({
    queryKey: ["low-stock"],
    queryFn: () => productApi.lowStock(5),
    select: (res) => res.data,
  });

  if (isLoading) return <Loader label="Đang tải thống kê" />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const { summary, revenueByDay, statusBreakdown, topProducts } = data;

  const revenueData = revenueByDay.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
  }));

  const statusData = statusBreakdown.map((s) => ({
    ...s,
    label: ORDER_STATUS_LABELS[s.status] || s.status,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Tổng quan"
        description="Doanh thu, đơn hàng và sản phẩm bán chạy."
        action={
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Chi so tong quan */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          Icon={CurrencyCircleDollar}
          label="Doanh thu đã thanh toán"
          value={formatVND(summary.totalRevenue)}
          sub={`Giá trị đơn trung bình ${formatVND(summary.avgOrderValue)}`}
        />
        <StatCard
          Icon={Receipt}
          label="Tổng đơn hàng"
          value={formatNumber(summary.totalOrders)}
          sub={`${summary.pendingOrders} đơn đang chờ xác nhận`}
        />
        <StatCard
          Icon={Users}
          label="Khách hàng mới"
          value={formatNumber(summary.newCustomers)}
          sub={`Tổng ${formatNumber(summary.totalCustomers)} khách hàng`}
        />
        <StatCard
          Icon={Warning}
          label="Sản phẩm sắp hết"
          value={formatNumber(summary.lowStockProducts)}
          sub="Tồn kho ở hoặc dưới ngưỡng cảnh báo"
          tone={summary.lowStockProducts > 0 ? "warn" : "default"}
        />
      </div>

      {/* Bieu do doanh thu */}
      <div className="mt-6 bezel">
        <div className="bezel-core p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-normal text-ink">Doanh thu theo ngày</h2>
              <p className="mt-1 text-xs text-ink-faint">Chỉ tính đơn đã thanh toán</p>
            </div>
            <Badge variant="outline">
              <TrendUp size={12} weight="light" /> {RANGES.find((r) => r.value === days)?.label}
            </Badge>
          </div>

          <div className="mt-8 h-72 w-full">
            {revenueData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink-faint">
                Chưa có doanh thu trong khoảng thời gian này
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 5, left: -12 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.fillFrom} />
                      <stop offset="100%" stopColor={CHART.fillTo} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: CHART.axis, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: CHART.axis, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}tr` : `${v / 1000}k`)}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(value, key) =>
                          key === "revenue" ? formatVND(value) : `${value} đơn`
                        }
                      />
                    }
                    cursor={{ stroke: CHART.grid }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART.line}
                    strokeWidth={1.5}
                    fill="url(#revenueFill)"
                    dot={false}
                    activeDot={{ r: 4, fill: CHART.line, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Don theo trang thai */}
        <div className="bezel">
          <div className="bezel-core p-6 md:p-8">
            <h2 className="font-display text-xl font-normal text-ink">Đơn hàng theo trạng thái</h2>
            <div className="mt-8 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: CHART.axis, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={54}
                  />
                  <YAxis tick={{ fill: CHART.axis, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v} đơn`} />} cursor={{ fill: "rgba(11,11,11,0.04)" }} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={44}>
                    {statusData.map((entry, i) => (
                      <Cell key={entry.status} fill={CHART.bars[i % CHART.bars.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top san pham */}
        <div className="bezel">
          <div className="bezel-core p-6 md:p-8">
            <h2 className="font-display text-xl font-normal text-ink">Bán chạy nhất</h2>
            {topProducts.length === 0 ? (
              <p className="mt-8 text-sm text-ink-faint">Chưa có dữ liệu bán hàng</p>
            ) : (
              <ol className="mt-7 space-y-4">
                {topProducts.map((product, i) => (
                  <li key={product._id} className="flex items-center gap-4">
                    <span className="w-5 text-[0.625rem] tabular-nums text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
                      {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{product.name}</p>
                      <p className="text-xs text-ink-faint">{product.quantity} đã bán</p>
                    </div>
                    <span className="text-sm tabular-nums text-ink">{formatVND(product.revenue)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Canh bao ton kho */}
      {lowStock?.items?.length > 0 && (
        <div className="mt-6 rounded-md border border-red-700/20 bg-red-700/[0.04] p-6">
          <div className="flex items-center gap-2.5">
            <Warning size={17} weight="light" className="text-red-700" />
            <h2 className="text-sm font-medium text-ink">
              {lowStock.items.length} sản phẩm sắp hết hàng (ngưỡng {lowStock.threshold})
            </h2>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.items.map((product) => (
              <li key={product._id}>
                <Link
                  to="/admin/san-pham"
                  className="flex items-center gap-3 rounded-md bg-white p-3 transition-shadow duration-400 hover:shadow-ambient"
                >
                  <div className="h-11 w-9 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
                    <img src={product.images?.[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-ink">{product.name}</p>
                    <p className="text-[0.625rem] text-red-700">
                      {product.variants
                        .filter((v) => v.stock <= lowStock.threshold)
                        .map((v) => `${v.name}: ${v.stock}`)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
