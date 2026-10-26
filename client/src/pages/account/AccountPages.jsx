import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Heart, MapPin, Plus, PencilSimple, Trash, Star } from "@phosphor-icons/react";
import { toast } from "sonner";
import { authApi, userApi } from "@/services/api";
import { useAuth } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { EmptyState, Loader } from "@/components/common";
import { Input, Field } from "@/components/ui/input";
import { Button, ButtonCTA } from "@/components/ui/button";
import { Badge, Separator } from "@/components/ui/display";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay";
import ProductCard from "@/components/product/ProductCard";

const PanelHeading = ({ title, description, action }) => (
  <div className="flex flex-wrap items-end justify-between gap-4 pb-7">
    <div>
      <h2 className="font-display text-2xl font-normal text-ink">{title}</h2>
      {description && <p className="mt-2 text-sm text-ink-muted">{description}</p>}
    </div>
    {action}
  </div>
);

/* ------------------------------- Ho so ca nhan ------------------------------ */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ")
    .or(z.literal("")),
});

export const ProfilePage = () => {
  const { user } = useAuth();
  const patchUser = useAuthStore((s) => s.patchUser);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "", phone: user?.phone || "" },
  });

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const res = await userApi.updateProfile(values);
      patchUser(res.data);
      toast.success("Đã cập nhật hồ sơ");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PanelHeading title="Hồ sơ của tôi" description="Cập nhật thông tin liên hệ dùng cho đơn hàng." />

      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-7">
        <Field label="Họ và tên" required error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} autoComplete="name" />
        </Field>

        <Field label="Email" hint="Email đăng nhập không thể thay đổi">
          <Input value={user?.email || ""} disabled />
        </Field>

        <Field label="Số điện thoại" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} autoComplete="tel" inputMode="tel" placeholder="0912345678" />
        </Field>

        <ButtonCTA type="submit" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </ButtonCTA>
      </form>
    </div>
  );
};

/* --------------------------------- Bao mat --------------------------------- */

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });

export const SecurityPage = () => {
  const [saving, setSaving] = useState(false);
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setSaving(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Đã đổi mật khẩu");
      form.reset();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PanelHeading title="Bảo mật" description="Đổi mật khẩu đăng nhập của tài khoản." />

      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-7">
        <Field label="Mật khẩu hiện tại" required error={form.formState.errors.currentPassword?.message}>
          <Input type="password" autoComplete="current-password" {...form.register("currentPassword")} />
        </Field>
        <Field label="Mật khẩu mới" required error={form.formState.errors.newPassword?.message}>
          <Input type="password" autoComplete="new-password" {...form.register("newPassword")} />
        </Field>
        <Field label="Nhập lại mật khẩu mới" required error={form.formState.errors.confirmPassword?.message}>
          <Input type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
        </Field>

        <ButtonCTA type="submit" disabled={saving}>
          {saving ? "Đang lưu…" : "Đổi mật khẩu"}
        </ButtonCTA>
      </form>
    </div>
  );
};

/* -------------------------------- So dia chi ------------------------------- */

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),
  province: z.string().trim().min(1, "Vui lòng nhập tỉnh/thành phố"),
  district: z.string().trim().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().trim().min(1, "Vui lòng nhập phường/xã"),
  street: z.string().trim().min(3, "Vui lòng nhập địa chỉ cụ thể"),
  isDefault: z.boolean().optional(),
});

const AddressDialog = ({ address, trigger, onSaved }) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(address);

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: address?.fullName || "",
      phone: address?.phone || "",
      province: address?.province || "",
      district: address?.district || "",
      ward: address?.ward || "",
      street: address?.street || "",
      isDefault: address?.isDefault || false,
    },
  });

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const res = isEdit
        ? await userApi.updateAddress(address._id, values)
        : await userApi.addAddress(values);
      onSaved(res.data);
      toast.success(isEdit ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ");
      setOpen(false);
      if (!isEdit) form.reset();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</DialogTitle>
          <DialogDescription>Địa chỉ này sẽ hiển thị khi bạn thanh toán.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
          <Field label="Họ và tên" required error={form.formState.errors.fullName?.message}>
            <Input {...form.register("fullName")} />
          </Field>
          <Field label="Số điện thoại" required error={form.formState.errors.phone?.message}>
            <Input {...form.register("phone")} inputMode="tel" />
          </Field>
          <Field label="Tỉnh / Thành phố" required error={form.formState.errors.province?.message}>
            <Input {...form.register("province")} />
          </Field>
          <Field label="Quận / Huyện" required error={form.formState.errors.district?.message}>
            <Input {...form.register("district")} />
          </Field>
          <Field label="Phường / Xã" required error={form.formState.errors.ward?.message}>
            <Input {...form.register("ward")} />
          </Field>
          <Field label="Địa chỉ cụ thể" required error={form.formState.errors.street?.message}>
            <Input {...form.register("street")} />
          </Field>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-muted sm:col-span-2">
            <input
              type="checkbox"
              {...form.register("isDefault")}
              className="h-4 w-4 rounded-[3px] border-ink/25 accent-ink"
            />
            Đặt làm địa chỉ mặc định
          </label>

          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <ButtonCTA type="submit" disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu địa chỉ"}
            </ButtonCTA>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const AddressesPage = () => {
  const { user } = useAuth();
  const patchUser = useAuthStore((s) => s.patchUser);
  const addresses = user?.addresses || [];

  const handleSaved = (list) => patchUser({ addresses: list });

  const handleDelete = async (id) => {
    try {
      const res = await userApi.removeAddress(id);
      patchUser({ addresses: res.data });
      toast.success("Đã xoá địa chỉ");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSetDefault = async (address) => {
    try {
      const res = await userApi.updateAddress(address._id, { isDefault: true });
      patchUser({ addresses: res.data });
      toast.success("Đã đặt làm địa chỉ mặc định");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PanelHeading
        title="Sổ địa chỉ"
        description="Lưu sẵn địa chỉ để thanh toán nhanh hơn ở lần sau."
        action={
          <AddressDialog
            onSaved={handleSaved}
            trigger={
              <ButtonCTA size="sm" icon={<Plus size={13} weight="light" />}>
                Thêm địa chỉ
              </ButtonCTA>
            }
          />
        }
      />

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin size={20} weight="light" />}
          title="Chưa có địa chỉ nào"
          description="Thêm địa chỉ giao hàng để không phải nhập lại mỗi lần đặt hàng."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={cn(
                "rounded-md border p-5 transition-colors duration-400",
                address.isDefault ? "border-ink" : "border-ink/12",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">{address.fullName}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">{address.phone}</p>
                </div>
                {address.isDefault && <Badge variant="outline">Mặc định</Badge>}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {address.street}, {address.ward}, {address.district}, {address.province}
              </p>

              <Separator className="my-4" />

              <div className="flex flex-wrap items-center gap-4 text-[0.625rem] uppercase tracking-editorial">
                <AddressDialog
                  address={address}
                  onSaved={handleSaved}
                  trigger={
                    <button type="button" className="flex items-center gap-1.5 text-ink-muted hover:text-ink">
                      <PencilSimple size={12} weight="light" /> Sửa
                    </button>
                  }
                />
                {!address.isDefault && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address)}
                      className="flex items-center gap-1.5 text-ink-muted hover:text-ink"
                    >
                      <Star size={12} weight="light" /> Đặt mặc định
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(address._id)}
                      className="flex items-center gap-1.5 text-ink-faint hover:text-red-700"
                    >
                      <Trash size={12} weight="light" /> Xoá
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* -------------------------------- Yeu thich -------------------------------- */

export const WishlistPage = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: userApi.wishlist,
    select: (res) => res.data,
  });

  return (
    <div>
      <PanelHeading
        title="Danh sách yêu thích"
        description="Những sản phẩm bạn đã lưu lại để cân nhắc."
      />

      {isLoading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Heart size={20} weight="light" />}
          title="Chưa lưu sản phẩm nào"
          description="Nhấn biểu tượng trái tim trên sản phẩm để lưu lại cho lần sau."
          action={
            <ButtonCTA variant="outline" asChild>
              <Link to="/shop">Khám phá bộ sưu tập</Link>
            </ButtonCTA>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};
