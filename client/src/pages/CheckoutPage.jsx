import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Money, CreditCard, Wallet, TagSimple, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn, formatVND, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import { orderApi, userApi } from "@/services/api";
import { useAuth, useCart } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { SEO, Breadcrumb } from "@/components/common";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Button, ButtonCTA } from "@/components/ui/button";
import { RadioGroup, RadioCard } from "@/components/ui/controls";
import { Badge, Separator } from "@/components/ui/display";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ (VD: 0912345678)"),
  province: z.string().trim().min(1, "Vui lòng nhập tỉnh/thành phố"),
  district: z.string().trim().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().trim().min(1, "Vui lòng nhập phường/xã"),
  street: z.string().trim().min(3, "Vui lòng nhập địa chỉ cụ thể"),
  note: z.string().max(500).optional(),
  saveAddress: z.boolean().optional(),
});

const PAYMENT_OPTIONS = [
  {
    value: "cod",
    Icon: Money,
    description: "Thanh toán bằng tiền mặt khi nhận hàng. Kiểm tra hàng trước khi trả tiền.",
  },
  {
    value: "vnpay",
    Icon: Wallet,
    description: "Chuyển tới cổng VNPay để thanh toán bằng thẻ nội địa hoặc QR ngân hàng.",
  },
  {
    value: "stripe",
    Icon: CreditCard,
    description: "Thanh toán bằng thẻ Visa / Mastercard qua Stripe.",
  },
];

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();
  const patchUser = useAuthStore((s) => s.patchUser);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [placing, setPlacing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: defaultAddress?.fullName || user?.name || "",
      phone: defaultAddress?.phone || user?.phone || "",
      province: defaultAddress?.province || "",
      district: defaultAddress?.district || "",
      ward: defaultAddress?.ward || "",
      street: defaultAddress?.street || "",
      note: "",
      saveAddress: !user?.addresses?.length,
    },
  });

  useEffect(() => {
    if (defaultAddress) setSelectedAddressId(defaultAddress._id);
  }, [defaultAddress]);

  // Xem truoc tong tien - server la nguon su that cho moi con so
  const { data: preview, isFetching: previewing } = useQuery({
    queryKey: ["order-preview", appliedCoupon],
    queryFn: () => orderApi.preview(appliedCoupon || undefined),
    select: (res) => res.data,
  });

  useEffect(() => {
    if (preview?.couponError && appliedCoupon) {
      toast.error(preview.couponError);
      setAppliedCoupon("");
    }
  }, [preview?.couponError, appliedCoupon]);

  useEffect(() => {
    if (cart.items.length === 0 && !placing) navigate("/gio-hang", { replace: true });
  }, [cart.items.length, placing, navigate]);

  const pickAddress = (address) => {
    setSelectedAddressId(address._id);
    form.reset({
      ...form.getValues(),
      fullName: address.fullName,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      saveAddress: false,
    });
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setAppliedCoupon(code);
    setCouponInput("");
  };

  const onSubmit = async (values) => {
    setPlacing(true);
    try {
      const { note, saveAddress, ...address } = values;

      if (saveAddress) {
        try {
          const res = await userApi.addAddress({ ...address, isDefault: !user?.addresses?.length });
          patchUser({ addresses: res.data });
        } catch {
          /* luu dia chi that bai khong nen chan viec dat hang */
        }
      }

      const res = await orderApi.create({
        shippingAddress: address,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        note,
      });

      const { order, payment } = res.data;

      if (payment?.redirectUrl) {
        toast.success("Đang chuyển tới cổng thanh toán…");
        window.location.href = payment.redirectUrl;
        return;
      }

      navigate(`/dat-hang-thanh-cong/${order.orderCode}`, { replace: true, state: { order } });
    } catch (err) {
      toast.error(err.message);
      setPlacing(false);
    }
  };

  if (!preview) {
    return (
      <div className="container pt-32">
        <p className="text-sm text-ink-faint">Đang tải thông tin đơn hàng…</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Thanh toán" noIndex />

      <div className="container pt-28 md:pt-36">
        <Breadcrumb items={[{ label: "Giỏ hàng", to: "/gio-hang" }, { label: "Thanh toán" }]} />
        <h1 className="mt-7 font-display text-display-sm font-normal text-ink">Hoàn tất đơn hàng</h1>
        <CheckoutSteps current={1} className="mt-10" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <section className="container grid gap-12 py-14 lg:grid-cols-[1fr_22rem] lg:gap-16 lg:py-16">
          <div className="space-y-14">
            {/* Dia chi da luu */}
            {user?.addresses?.length > 0 && (
              <div>
                <h2 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Địa chỉ đã lưu</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {user.addresses.map((address) => (
                    <button
                      key={address._id}
                      type="button"
                      onClick={() => pickAddress(address)}
                      className={cn(
                        "rounded-md border p-4 text-left transition-all duration-500 ease-spring",
                        selectedAddressId === address._id
                          ? "border-ink bg-ink/[0.025]"
                          : "border-ink/12 hover:border-ink/30",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">{address.fullName}</span>
                        {address.isDefault && <Badge variant="outline">Mặc định</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-ink-faint">{address.phone}</p>
                      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                        {address.street}, {address.ward}, {address.district}, {address.province}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Thong tin giao hang */}
            <div>
              <h2 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Thông tin giao hàng</h2>
              <div className="mt-6 grid gap-x-6 gap-y-7 sm:grid-cols-2">
                <Field label="Họ và tên" required error={form.formState.errors.fullName?.message}>
                  <Input {...form.register("fullName")} placeholder="Nguyễn Văn A" autoComplete="name" />
                </Field>
                <Field label="Số điện thoại" required error={form.formState.errors.phone?.message}>
                  <Input {...form.register("phone")} placeholder="0912345678" autoComplete="tel" inputMode="tel" />
                </Field>
                <Field label="Tỉnh / Thành phố" required error={form.formState.errors.province?.message}>
                  <Input {...form.register("province")} placeholder="Hà Nội" />
                </Field>
                <Field label="Quận / Huyện" required error={form.formState.errors.district?.message}>
                  <Input {...form.register("district")} placeholder="Cầu Giấy" />
                </Field>
                <Field label="Phường / Xã" required error={form.formState.errors.ward?.message}>
                  <Input {...form.register("ward")} placeholder="Dịch Vọng Hậu" />
                </Field>
                <Field label="Địa chỉ cụ thể" required error={form.formState.errors.street?.message}>
                  <Input {...form.register("street")} placeholder="Số 12, ngõ 5 Trần Thái Tông" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Ghi chú cho đơn hàng" hint="Ví dụ: giao giờ hành chính, gọi trước khi tới">
                    <Textarea rows={3} {...form.register("note")} placeholder="Không bắt buộc" />
                  </Field>
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-muted sm:col-span-2">
                  <input
                    type="checkbox"
                    {...form.register("saveAddress")}
                    className="h-4 w-4 rounded-[3px] border-ink/25 accent-ink"
                  />
                  Lưu địa chỉ này cho lần đặt hàng sau
                </label>
              </div>
            </div>

            {/* Phuong thuc thanh toan */}
            <div>
              <h2 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                Phương thức thanh toán
              </h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-6">
                {PAYMENT_OPTIONS.map(({ value, Icon, description }) => (
                  <RadioCard
                    key={value}
                    value={value}
                    id={`pay-${value}`}
                    title={PAYMENT_METHOD_LABELS[value]}
                    description={description}
                    icon={<Icon size={16} weight="light" className="text-copper-dark" />}
                  />
                ))}
              </RadioGroup>
              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                VNPay và Stripe cần khoá API trong <code className="font-mono">server/.env</code>. Nếu chưa
                cấu hình, hãy dùng COD để chạy thử toàn bộ luồng đặt hàng.
              </p>
            </div>
          </div>

          {/* Tom tat */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="bezel">
              <div className="bezel-core p-7">
                <h2 className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Đơn hàng</h2>

                <ul className="mt-5 space-y-4">
                  {preview.items.map((item) => (
                    <li key={item._id} className="flex gap-3.5">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
                        <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.5625rem] tabular-nums text-bone">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink">{item.product.name}</p>
                        <p className="text-xs text-ink-faint">{item.variantName}</p>
                      </div>
                      <span className="text-sm tabular-nums text-ink">{formatVND(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                <Separator className="my-6" />

                {/* Ma giam gia */}
                {preview.coupon ? (
                  <div className="flex items-center justify-between rounded-md bg-copper/10 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <TagSimple size={14} weight="light" className="text-copper-dark" />
                      <span className="font-mono text-xs uppercase text-copper-dark">{preview.coupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon("")}
                      className="text-ink-faint transition-colors hover:text-ink"
                      aria-label="Bỏ mã giảm giá"
                    >
                      <X size={13} weight="light" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-end gap-3">
                    <Field label="Mã giảm giá" className="flex-1">
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            applyCoupon();
                          }
                        }}
                        placeholder="MORRIS10"
                        className="h-10 font-mono text-xs uppercase"
                      />
                    </Field>
                    <Button type="button" variant="outline" size="sm" onClick={applyCoupon} disabled={previewing}>
                      Áp dụng
                    </Button>
                  </div>
                )}

                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Tạm tính</dt>
                    <dd className="tabular-nums text-ink">{formatVND(preview.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Phí vận chuyển</dt>
                    <dd className="tabular-nums text-ink">
                      {preview.shippingFee === 0 ? (
                        <span className="text-copper-dark">Miễn phí</span>
                      ) : (
                        formatVND(preview.shippingFee)
                      )}
                    </dd>
                  </div>
                  {preview.discount > 0 && (
                    <div className="flex justify-between text-copper-dark">
                      <dt>Giảm giá</dt>
                      <dd className="tabular-nums">− {formatVND(preview.discount)}</dd>
                    </div>
                  )}
                </dl>

                <Separator className="my-5" />

                <div className="flex items-baseline justify-between">
                  <span className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Tổng cộng</span>
                  <span className="font-display text-3xl tabular-nums text-ink">{formatVND(preview.total)}</span>
                </div>

                <ButtonCTA type="submit" size="lg" className="mt-7 w-full" disabled={placing || previewing}>
                  {placing ? "Đang xử lý…" : "Đặt hàng"}
                </ButtonCTA>

                <p className="mt-4 text-center text-xs leading-relaxed text-ink-faint">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <Link to="/about" className="underline underline-offset-2 hover:text-ink">
                    điều khoản dịch vụ
                  </Link>{" "}
                  của Morris.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </form>
    </>
  );
};

export default CheckoutPage;
