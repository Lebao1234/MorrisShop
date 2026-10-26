import { useEffect, useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, PencilSimple, Trash, Check, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { categoryApi, couponApi, bannerApi, reviewApi } from "@/services/api";
import { cn, formatVND, formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import { Pagination, RatingStars } from "@/components/common";
import { AdminPageHeader } from "./AdminLayout";
import { AdminTable, AdminToolbar } from "@/components/admin/AdminTable";
import ImageUploader from "@/components/admin/ImageUploader";
import { Badge } from "@/components/ui/display";
import { Button, ButtonCTA } from "@/components/ui/button";
import { Input, Textarea, Field } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Switch } from "@/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/overlay";

/** Hop thoai xac nhan xoa dung chung */
const ConfirmDelete = ({ item, label, onConfirm, onClose }) => (
  <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Xoá {label} này?</DialogTitle>
        <DialogDescription>Thao tác không thể hoàn tác.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Huỷ
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Xoá vĩnh viễn
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/* ================================ Danh muc =============================== */

const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục quá ngắn"),
  description: z.string().optional(),
  parentCategory: z.string().optional(),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const CategoryManagePage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [image, setImage] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => categoryApi.list({ includeInactive: true }),
    select: (res) => res.data,
  });

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", parentCategory: "none", position: 0, isActive: true },
  });

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      form.reset({
        name: editing.name,
        description: editing.description || "",
        parentCategory: editing.parentCategory ? String(editing.parentCategory) : "none",
        position: editing.position || 0,
        isActive: editing.isActive !== false,
      });
      setImage(editing.image ? [editing.image] : []);
    } else {
      form.reset({ name: "", description: "", parentCategory: "none", position: 0, isActive: true });
      setImage([]);
    }
  }, [dialogOpen, editing, form]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["categories"] });

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      parentCategory: values.parentCategory === "none" ? null : values.parentCategory,
      image: image[0] || "",
    };
    setSaving(true);
    try {
      if (editing) await categoryApi.update(editing._id, payload);
      else await categoryApi.create(payload);
      toast.success(editing ? "Đã cập nhật danh mục" : "Đã tạo danh mục");
      setDialogOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await categoryApi.remove(deleting._id);
      toast.success("Đã xoá danh mục");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Danh mục",
      render: (cat) => (
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-14 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
            {cat.image && <img src={cat.image} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <p className="text-sm text-ink">{cat.name}</p>
            <p className="mt-0.5 font-mono text-[0.625rem] text-ink-faint">{cat.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Danh mục cha",
      render: (cat) => (
        <span className="text-sm text-ink-muted">
          {categories.find((c) => String(c._id) === String(cat.parentCategory))?.name || "—"}
        </span>
      ),
    },
    {
      key: "position",
      header: "Thứ tự",
      align: "right",
      render: (cat) => <span className="text-sm tabular-nums text-ink-muted">{cat.position || 0}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (cat) => (
        <Badge variant={cat.isActive ? "success" : "muted"}>{cat.isActive ? "Hiển thị" : "Đã ẩn"}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (cat) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditing(cat);
              setDialogOpen(true);
            }}
            aria-label="Sửa danh mục"
          >
            <PencilSimple size={15} weight="light" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleting(cat)}
            aria-label="Xoá danh mục"
            className="hover:text-red-700"
          >
            <Trash size={15} weight="light" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Danh mục"
        description="Sắp xếp sản phẩm theo nhóm. Danh mục đang chứa sản phẩm không thể xoá."
        action={
          <ButtonCTA
            icon={<Plus size={13} weight="light" />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Thêm danh mục
          </ButtonCTA>
        }
      />

      <AdminTable
        columns={columns}
        rows={categories}
        isLoading={isLoading}
        empty={{ title: "Chưa có danh mục nào" }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
            <DialogDescription>Slug được sinh tự động từ tên danh mục.</DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Field label="Tên danh mục" required error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Sáp vuốt tóc" />
            </Field>

            <Field label="Mô tả">
              <Textarea rows={3} {...form.register("description")} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Danh mục cha">
                <Select
                  value={form.watch("parentCategory")}
                  onValueChange={(v) => form.setValue("parentCategory", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có (danh mục gốc)</SelectItem>
                    {categories
                      .filter((c) => !editing || String(c._id) !== String(editing._id))
                      .map((cat) => (
                        <SelectItem key={cat._id} value={cat._id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Thứ tự hiển thị">
                <Input type="number" min={0} {...form.register("position")} />
              </Field>
            </div>

            <div>
              <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Ảnh danh mục</p>
              <ImageUploader value={image} onChange={setImage} folder="categories" max={1} className="mt-4" />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="cat-active"
                checked={form.watch("isActive")}
                onCheckedChange={(v) => form.setValue("isActive", v)}
              />
              <label htmlFor="cat-active" className="cursor-pointer text-sm text-ink-muted">
                Hiển thị trên cửa hàng
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Huỷ
              </Button>
              <ButtonCTA type="submit" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu"}
              </ButtonCTA>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete item={deleting} label="danh mục" onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </div>
  );
};

/* ============================== Ma giam gia ============================== */

const couponSchema = z
  .object({
    code: z.string().trim().min(3, "Mã tối thiểu 3 ký tự"),
    description: z.string().optional(),
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().min(0),
    minOrderValue: z.coerce.number().min(0),
    maxDiscount: z.coerce.number().min(0),
    usageLimit: z.coerce.number().int().min(0),
    perUserLimit: z.coerce.number().int().min(0),
    expiresAt: z.string().min(1, "Vui lòng chọn ngày hết hạn"),
    isActive: z.boolean(),
  })
  .refine((v) => v.type !== "percent" || v.value <= 100, {
    message: "Phần trăm giảm tối đa là 100",
    path: ["value"],
  });

export const CouponManagePage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  const params = { page, limit: 15, search: debouncedSearch || undefined };
  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons", params],
    queryFn: () => couponApi.list(params),
    placeholderData: keepPreviousData,
  });

  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      type: "percent",
      value: 10,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      perUserLimit: 0,
      expiresAt: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      form.reset({
        code: editing.code,
        description: editing.description || "",
        type: editing.type,
        value: editing.value,
        minOrderValue: editing.minOrderValue || 0,
        maxDiscount: editing.maxDiscount || 0,
        usageLimit: editing.usageLimit || 0,
        perUserLimit: editing.perUserLimit || 0,
        expiresAt: editing.expiresAt ? new Date(editing.expiresAt).toISOString().slice(0, 10) : "",
        isActive: editing.isActive !== false,
      });
    } else {
      const inThirtyDays = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
      form.reset({
        code: "",
        description: "",
        type: "percent",
        value: 10,
        minOrderValue: 0,
        maxDiscount: 0,
        usageLimit: 0,
        perUserLimit: 0,
        expiresAt: inThirtyDays,
        isActive: true,
      });
    }
  }, [dialogOpen, editing, form]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, expiresAt: new Date(values.expiresAt).toISOString() };
      if (editing) await couponApi.update(editing._id, payload);
      else await couponApi.create(payload);
      toast.success(editing ? "Đã cập nhật mã" : "Đã tạo mã giảm giá");
      setDialogOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await couponApi.remove(deleting._id);
      toast.success("Đã xoá mã giảm giá");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Mã",
      render: (coupon) => (
        <div>
          <p className="font-mono text-sm uppercase text-ink">{coupon.code}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{coupon.description}</p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Giảm",
      render: (coupon) => (
        <span className="text-sm text-ink">
          {coupon.type === "percent" ? `${coupon.value}%` : formatVND(coupon.value)}
          {coupon.maxDiscount > 0 && (
            <span className="ml-1 text-xs text-ink-faint">(tối đa {formatVND(coupon.maxDiscount)})</span>
          )}
        </span>
      ),
    },
    {
      key: "min",
      header: "Đơn tối thiểu",
      align: "right",
      render: (coupon) => (
        <span className="text-sm tabular-nums text-ink-muted">
          {coupon.minOrderValue ? formatVND(coupon.minOrderValue) : "—"}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Đã dùng",
      align: "right",
      render: (coupon) => (
        <span className="text-sm tabular-nums text-ink-muted">
          {coupon.usedCount || 0}
          {coupon.usageLimit > 0 ? ` / ${coupon.usageLimit}` : ""}
        </span>
      ),
    },
    {
      key: "expires",
      header: "Hết hạn",
      render: (coupon) => {
        const expired = new Date(coupon.expiresAt) < new Date();
        return (
          <span className={cn("text-sm", expired ? "text-red-700" : "text-ink-muted")}>
            {formatDate(coupon.expiresAt)}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (coupon) => (
        <Badge variant={coupon.isActive ? "success" : "muted"}>
          {coupon.isActive ? "Đang chạy" : "Tạm dừng"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (coupon) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditing(coupon);
              setDialogOpen(true);
            }}
            aria-label="Sửa mã"
          >
            <PencilSimple size={15} weight="light" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleting(coupon)}
            aria-label="Xoá mã"
            className="hover:text-red-700"
          >
            <Trash size={15} weight="light" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Mã giảm giá"
        description="Tạo và quản lý chương trình khuyến mãi theo thời gian."
        action={
          <ButtonCTA
            icon={<Plus size={13} weight="light" />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Tạo mã mới
          </ButtonCTA>
        }
      />

      <AdminToolbar search={search} onSearch={setSearch} placeholder="Tìm theo mã…" />

      <AdminTable
        columns={columns}
        rows={data?.data || []}
        isLoading={isLoading}
        empty={{ title: "Chưa có mã giảm giá nào" }}
      />

      {data?.meta?.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-10" />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}</DialogTitle>
            <DialogDescription>Đặt 0 cho các giới hạn nghĩa là không giới hạn.</DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
            <Field label="Mã" required error={form.formState.errors.code?.message}>
              <Input {...form.register("code")} placeholder="MORRIS10" className="font-mono uppercase" />
            </Field>

            <Field label="Loại giảm">
              <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Theo phần trăm (%)</SelectItem>
                  <SelectItem value="fixed">Số tiền cố định (đ)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field
              label={form.watch("type") === "percent" ? "Phần trăm giảm" : "Số tiền giảm"}
              required
              error={form.formState.errors.value?.message}
            >
              <Input type="number" min={0} {...form.register("value")} />
            </Field>

            <Field label="Giảm tối đa" hint="Chỉ áp dụng cho loại %">
              <Input type="number" min={0} step={1000} {...form.register("maxDiscount")} />
            </Field>

            <Field label="Giá trị đơn tối thiểu">
              <Input type="number" min={0} step={1000} {...form.register("minOrderValue")} />
            </Field>

            <Field label="Ngày hết hạn" required error={form.formState.errors.expiresAt?.message}>
              <Input type="date" {...form.register("expiresAt")} />
            </Field>

            <Field label="Tổng lượt dùng" hint="0 = không giới hạn">
              <Input type="number" min={0} {...form.register("usageLimit")} />
            </Field>

            <Field label="Lượt dùng / khách" hint="0 = không giới hạn">
              <Input type="number" min={0} {...form.register("perUserLimit")} />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Mô tả" hint="Hiển thị cho khách ở trang giỏ hàng">
                <Input {...form.register("description")} placeholder="Giảm 10% cho đơn từ 300.000đ" />
              </Field>
            </div>

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                id="coupon-active"
                checked={form.watch("isActive")}
                onCheckedChange={(v) => form.setValue("isActive", v)}
              />
              <label htmlFor="coupon-active" className="cursor-pointer text-sm text-ink-muted">
                Kích hoạt mã
              </label>
            </div>

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Huỷ
              </Button>
              <ButtonCTA type="submit" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu"}
              </ButtonCTA>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete item={deleting} label="mã giảm giá" onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </div>
  );
};

/* ================================= Banner ================================ */

const BANNER_TYPES = [
  { value: "hero_video", label: "Hero — video nền" },
  { value: "hero_image", label: "Hero — ảnh nền" },
  { value: "collection_banner", label: "Thẻ bộ sưu tập" },
  { value: "promo", label: "Băng khuyến mãi" },
  { value: "story", label: "Khối câu chuyện" },
];

const bannerSchema = z.object({
  type: z.enum(["hero_video", "hero_image", "collection_banner", "promo", "story"]),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  mediaUrl: z.string().min(1, "Cần đường dẫn media"),
  posterUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const BannerManagePage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [poster, setPoster] = useState([]);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => bannerApi.list({ includeInactive: true }),
    select: (res) => res.data,
  });

  const form = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      type: "collection_banner",
      eyebrow: "",
      title: "",
      subtitle: "",
      ctaLabel: "",
      mediaUrl: "",
      posterUrl: "",
      linkUrl: "/shop",
      position: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!dialogOpen) return;
    if (editing) {
      form.reset({
        type: editing.type,
        eyebrow: editing.eyebrow || "",
        title: editing.title || "",
        subtitle: editing.subtitle || "",
        ctaLabel: editing.ctaLabel || "",
        mediaUrl: editing.mediaUrl || "",
        posterUrl: editing.posterUrl || "",
        linkUrl: editing.linkUrl || "/shop",
        position: editing.position || 0,
        isActive: editing.isActive !== false,
      });
      setPoster(editing.posterUrl ? [editing.posterUrl] : []);
    } else {
      form.reset({
        type: "collection_banner",
        eyebrow: "",
        title: "",
        subtitle: "",
        ctaLabel: "",
        mediaUrl: "",
        posterUrl: "",
        linkUrl: "/shop",
        position: 0,
        isActive: true,
      });
      setPoster([]);
    }
  }, [dialogOpen, editing, form]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    queryClient.invalidateQueries({ queryKey: ["home-content"] });
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = { ...values, posterUrl: poster[0] || values.posterUrl || "" };
      if (editing) await bannerApi.update(editing._id, payload);
      else await bannerApi.create(payload);
      toast.success(editing ? "Đã cập nhật banner" : "Đã tạo banner");
      setDialogOpen(false);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await bannerApi.remove(deleting._id);
      toast.success("Đã xoá banner");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isVideo = form.watch("type") === "hero_video";

  const columns = [
    {
      key: "preview",
      header: "Nội dung",
      render: (banner) => (
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
            <img
              src={banner.type === "hero_video" ? banner.posterUrl : banner.mediaUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{banner.title || "(Không tiêu đề)"}</p>
            <p className="truncate text-xs text-ink-faint">{banner.subtitle}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Vị trí",
      render: (banner) => (
        <Badge variant="outline">{BANNER_TYPES.find((t) => t.value === banner.type)?.label || banner.type}</Badge>
      ),
    },
    {
      key: "link",
      header: "Liên kết",
      render: (banner) => <span className="font-mono text-xs text-ink-muted">{banner.linkUrl}</span>,
    },
    {
      key: "position",
      header: "Thứ tự",
      align: "right",
      render: (banner) => <span className="text-sm tabular-nums text-ink-muted">{banner.position || 0}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (banner) => (
        <Badge variant={banner.isActive ? "success" : "muted"}>
          {banner.isActive ? "Hiển thị" : "Đã ẩn"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (banner) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditing(banner);
              setDialogOpen(true);
            }}
            aria-label="Sửa banner"
          >
            <PencilSimple size={15} weight="light" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleting(banner)}
            aria-label="Xoá banner"
            className="hover:text-red-700"
          >
            <Trash size={15} weight="light" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Nội dung trang chủ"
        description="Quản lý hero video, thẻ bộ sưu tập và các băng khuyến mãi hiển thị ở trang chủ."
        action={
          <ButtonCTA
            icon={<Plus size={13} weight="light" />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Thêm nội dung
          </ButtonCTA>
        }
      />

      <AdminTable
        columns={columns}
        rows={banners}
        isLoading={isLoading}
        empty={{ title: "Chưa có nội dung nào", description: "Thêm hero video hoặc thẻ bộ sưu tập cho trang chủ." }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa nội dung" : "Thêm nội dung trang chủ"}</DialogTitle>
            <DialogDescription>
              Với hero video, dán URL file .mp4 vào ô Media và chọn ảnh poster hiển thị trong lúc video tải.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
            <Field label="Vị trí hiển thị" required>
              <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BANNER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Thứ tự">
              <Input type="number" min={0} {...form.register("position")} />
            </Field>

            <Field label="Nhãn nhỏ (eyebrow)">
              <Input {...form.register("eyebrow")} placeholder="Bộ sưu tập 2026" />
            </Field>

            <Field label="Nhãn nút CTA">
              <Input {...form.register("ctaLabel")} placeholder="Khám phá bộ sưu tập" />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Tiêu đề">
                <Input {...form.register("title")} placeholder="Kết cấu làm nên phong thái" />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Mô tả">
                <Textarea rows={2} {...form.register("subtitle")} />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field
                label={isVideo ? "URL video (.mp4)" : "URL ảnh"}
                required
                error={form.formState.errors.mediaUrl?.message}
              >
                <Input {...form.register("mediaUrl")} placeholder="https://…" className="font-mono text-xs" />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Liên kết khi bấm vào">
                <Input {...form.register("linkUrl")} placeholder="/shop?category=sap-vuot-toc" className="font-mono text-xs" />
              </Field>
            </div>

            {isVideo && (
              <div className="sm:col-span-2">
                <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                  Ảnh poster (hiển thị trong lúc video tải)
                </p>
                <ImageUploader value={poster} onChange={setPoster} folder="banners" max={1} className="mt-4" />
              </div>
            )}

            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                id="banner-active"
                checked={form.watch("isActive")}
                onCheckedChange={(v) => form.setValue("isActive", v)}
              />
              <label htmlFor="banner-active" className="cursor-pointer text-sm text-ink-muted">
                Hiển thị trên trang chủ
              </label>
            </div>

            <DialogFooter className="sm:col-span-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Huỷ
              </Button>
              <ButtonCTA type="submit" disabled={saving}>
                {saving ? "Đang lưu…" : "Lưu"}
              </ButtonCTA>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete item={deleting} label="nội dung" onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </div>
  );
};

/* ================================ Danh gia =============================== */

export const ReviewManagePage = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const params = {
    page,
    limit: 15,
    isApproved: filter === "all" ? undefined : filter === "approved" ? "true" : "false",
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: () => reviewApi.listAll(params),
    placeholderData: keepPreviousData,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });

  const setApproval = async (review, isApproved) => {
    try {
      await reviewApi.approve(review._id, isApproved);
      toast.success(isApproved ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await reviewApi.remove(deleting._id);
      toast.success("Đã xoá đánh giá");
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: "product",
      header: "Sản phẩm",
      render: (review) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
            <img src={review.product?.images?.[0]} alt="" className="h-full w-full object-cover" />
          </div>
          <p className="min-w-0 truncate text-sm text-ink">{review.product?.name}</p>
        </div>
      ),
    },
    {
      key: "review",
      header: "Đánh giá",
      cellClassName: "max-w-md",
      render: (review) => (
        <div>
          <div className="flex items-center gap-2">
            <RatingStars value={review.rating} size={11} />
            <span className="text-xs text-ink-faint">{review.user?.name}</span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{review.comment}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Ngày",
      render: (review) => <span className="text-xs text-ink-faint">{formatDate(review.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (review) => (
        <Badge variant={review.isApproved ? "success" : "outline"}>
          {review.isApproved ? "Đã duyệt" : "Chờ duyệt"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (review) => (
        <div className="flex justify-end gap-1">
          {review.isApproved ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setApproval(review, false)}
              aria-label="Ẩn đánh giá"
            >
              <X size={15} weight="light" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setApproval(review, true)}
              aria-label="Duyệt đánh giá"
              className="hover:text-emerald-700"
            >
              <Check size={15} weight="light" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleting(review)}
            aria-label="Xoá đánh giá"
            className="hover:text-red-700"
          >
            <Trash size={15} weight="light" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Đánh giá"
        description="Duyệt đánh giá trước khi hiển thị công khai. Điểm trung bình chỉ tính đánh giá đã duyệt."
      />

      <div className="flex gap-1.5 pb-6">
        {[
          { value: "pending", label: "Chờ duyệt" },
          { value: "approved", label: "Đã duyệt" },
          { value: "all", label: "Tất cả" },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-4 py-2 text-[0.6875rem] uppercase tracking-wideish transition-all duration-400 ease-spring",
              filter === tab.value ? "bg-ink text-bone" : "text-ink-muted hover:bg-ink/[0.05]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        rows={data?.data || []}
        isLoading={isLoading}
        empty={{
          title: filter === "pending" ? "Không có đánh giá chờ duyệt" : "Chưa có đánh giá nào",
        }}
      />

      {data?.meta?.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-10" />
      )}

      <ConfirmDelete item={deleting} label="đánh giá" onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
    </div>
  );
};
