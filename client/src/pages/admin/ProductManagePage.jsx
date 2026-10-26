import { useEffect, useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, PencilSimple, Trash, Eye, EyeSlash } from "@phosphor-icons/react";
import { toast } from "sonner";
import { productApi, categoryApi } from "@/services/api";
import { cn, formatVND, HOLD_LABELS, FINISH_LABELS, totalStock, displayPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks";
import { Pagination } from "@/components/common";
import { AdminPageHeader } from "./AdminLayout";
import { AdminTable, AdminToolbar } from "@/components/admin/AdminTable";
import ImageUploader from "@/components/admin/ImageUploader";
import { Badge, Separator } from "@/components/ui/display";
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

const productSchema = z.object({
  name: z.string().trim().min(2, "Tên sản phẩm quá ngắn"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  brand: z.string().optional(),
  shortDescription: z.string().max(400).optional(),
  description: z.string().optional(),
  ingredients: z.string().optional(),
  howToUse: z.string().optional(),
  holdLevel: z.enum(["low", "medium", "high", "extreme"]),
  finish: z.enum(["matte", "shiny", "natural"]),
  hairTypeText: z.string().optional(),
  tagsText: z.string().optional(),
  isActive: z.boolean(),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Nhập tên phiên bản"),
        price: z.coerce.number().min(1000, "Giá tối thiểu 1.000đ"),
        salePrice: z.coerce.number().min(0),
        stock: z.coerce.number().int().min(0),
        sku: z.string().optional(),
      }),
    )
    .min(1, "Cần ít nhất 1 phiên bản"),
});

const emptyVariant = { name: "", price: 0, salePrice: 0, stock: 0, sku: "" };

const ProductDialog = ({ product, categories, open, onOpenChange, onSaved }) => {
  const isEdit = Boolean(product);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "Morris",
      shortDescription: "",
      description: "",
      ingredients: "",
      howToUse: "",
      holdLevel: "medium",
      finish: "natural",
      hairTypeText: "",
      tagsText: "",
      isActive: true,
      variants: [{ ...emptyVariant }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "variants" });

  // Nap du lieu khi mo dialog o che do sua
  useEffect(() => {
    if (!open) return;
    if (product) {
      form.reset({
        name: product.name,
        category: product.category?._id || product.category,
        brand: product.brand || "Morris",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        ingredients: product.ingredients || "",
        howToUse: product.howToUse || "",
        holdLevel: product.holdLevel || "medium",
        finish: product.finish || "natural",
        hairTypeText: (product.hairType || []).join(", "),
        tagsText: (product.tags || []).join(", "),
        isActive: product.isActive !== false,
        variants: product.variants.map((v) => ({
          name: v.name,
          price: v.price,
          salePrice: v.salePrice || 0,
          stock: v.stock,
          sku: v.sku,
        })),
      });
      setImages(product.images || []);
    } else {
      form.reset({
        name: "",
        category: categories[0]?._id || "",
        brand: "Morris",
        shortDescription: "",
        description: "",
        ingredients: "",
        howToUse: "",
        holdLevel: "medium",
        finish: "natural",
        hairTypeText: "",
        tagsText: "",
        isActive: true,
        variants: [{ ...emptyVariant }],
      });
      setImages([]);
    }
  }, [open, product, categories, form]);

  const onSubmit = async (values) => {
    if (images.length === 0) {
      toast.error("Cần ít nhất 1 ảnh sản phẩm");
      return;
    }

    const splitList = (text) =>
      (text || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const payload = {
      name: values.name,
      category: values.category,
      brand: values.brand,
      shortDescription: values.shortDescription,
      description: values.description,
      ingredients: values.ingredients,
      howToUse: values.howToUse,
      holdLevel: values.holdLevel,
      finish: values.finish,
      hairType: splitList(values.hairTypeText),
      tags: splitList(values.tagsText).map((t) => t.toLowerCase()),
      isActive: values.isActive,
      images,
      variants: values.variants.map((v) => ({
        name: v.name,
        price: Number(v.price),
        salePrice: Number(v.salePrice) || 0,
        stock: Number(v.stock),
        ...(v.sku ? { sku: v.sku } : {}),
      })),
    };

    setSaving(true);
    try {
      if (isEdit) await productApi.update(product._id, payload);
      else await productApi.create(payload);
      toast.success(isEdit ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
          <DialogDescription>
            Slug và SKU được sinh tự động từ tên nếu bạn để trống.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
            <Field label="Tên sản phẩm" required error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Iron Clay Matte Wax" />
            </Field>

            <Field label="Danh mục" required error={form.formState.errors.category?.message}>
              <Select value={form.watch("category")} onValueChange={(v) => form.setValue("category", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Thương hiệu">
              <Input {...form.register("brand")} />
            </Field>

            <Field label="Độ giữ nếp">
              <Select value={form.watch("holdLevel")} onValueChange={(v) => form.setValue("holdLevel", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(HOLD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Kết thúc">
              <Select value={form.watch("finish")} onValueChange={(v) => form.setValue("finish", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FINISH_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Loại tóc" hint="Ngăn cách bằng dấu phẩy">
              <Input {...form.register("hairTypeText")} placeholder="tóc thẳng, tóc dày" />
            </Field>

            <Field label="Thẻ (tags)" hint="bestseller, new, limited, combo…">
              <Input {...form.register("tagsText")} placeholder="bestseller, new" />
            </Field>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                checked={form.watch("isActive")}
                onCheckedChange={(v) => form.setValue("isActive", v)}
                id="product-active"
              />
              <label htmlFor="product-active" className="cursor-pointer text-sm text-ink-muted">
                Hiển thị trên cửa hàng
              </label>
            </div>

            <div className="sm:col-span-2">
              <Field label="Mô tả ngắn" hint="Hiển thị dưới tên sản phẩm, tối đa 400 ký tự">
                <Textarea rows={2} {...form.register("shortDescription")} />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Mô tả chi tiết">
                <Textarea rows={4} {...form.register("description")} />
              </Field>
            </div>

            <Field label="Thành phần">
              <Textarea rows={3} {...form.register("ingredients")} />
            </Field>

            <Field label="Cách dùng">
              <Textarea rows={3} {...form.register("howToUse")} />
            </Field>
          </div>

          <Separator />

          <div>
            <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">Hình ảnh</p>
            <ImageUploader value={images} onChange={setImages} folder="products" className="mt-4" />
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between">
              <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                Phiên bản & tồn kho
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ ...emptyVariant })}>
                <Plus size={12} weight="light" /> Thêm phiên bản
              </Button>
            </div>

            <ul className="mt-5 space-y-4">
              {fields.map((field, index) => (
                <li key={field.id} className="rounded-md border border-ink/12 p-4">
                  <div className="grid gap-x-4 gap-y-4 sm:grid-cols-4">
                    <Field label="Tên" required error={form.formState.errors.variants?.[index]?.name?.message}>
                      <Input {...form.register(`variants.${index}.name`)} placeholder="80g" className="h-10" />
                    </Field>
                    <Field label="Giá gốc" required error={form.formState.errors.variants?.[index]?.price?.message}>
                      <Input
                        type="number"
                        {...form.register(`variants.${index}.price`)}
                        className="h-10"
                        min={0}
                        step={1000}
                      />
                    </Field>
                    <Field label="Giá KM" hint="0 = không giảm">
                      <Input
                        type="number"
                        {...form.register(`variants.${index}.salePrice`)}
                        className="h-10"
                        min={0}
                        step={1000}
                      />
                    </Field>
                    <Field label="Tồn kho">
                      <Input type="number" {...form.register(`variants.${index}.stock`)} className="h-10" min={0} />
                    </Field>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="font-mono text-[0.625rem] uppercase text-ink-faint">
                      {form.watch(`variants.${index}.sku`) || "SKU sinh tự động"}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="flex items-center gap-1.5 text-[0.625rem] uppercase tracking-editorial text-ink-faint transition-colors hover:text-red-700"
                      >
                        <Trash size={12} weight="light" /> Xoá
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <ButtonCTA type="submit" disabled={saving}>
              {saving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </ButtonCTA>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const ProductManagePage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const debouncedSearch = useDebounce(search, 350);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => categoryApi.list({ includeInactive: true }),
    select: (res) => res.data,
  });

  const params = {
    page,
    limit: 15,
    search: debouncedSearch || undefined,
    category: category === "all" ? undefined : category,
    includeInactive: "true",
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => productApi.list(params),
    placeholderData: keepPreviousData,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-products"] });

  const toggleActive = async (product) => {
    try {
      await productApi.update(product._id, { isActive: !product.isActive });
      toast.success(product.isActive ? "Đã ẩn sản phẩm" : "Đã hiển thị sản phẩm");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await productApi.remove(deleting._id);
      toast.success("Đã xoá sản phẩm");
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
      render: (product) => (
        <div className="flex items-center gap-3.5">
          <div className="h-14 w-11 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
            <img src={product.images?.[0]} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-ink">{product.name}</p>
            <p className="mt-0.5 font-mono text-[0.625rem] text-ink-faint">{product.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      render: (product) => <span className="text-sm text-ink-muted">{product.category?.name || "—"}</span>,
    },
    {
      key: "price",
      header: "Giá từ",
      align: "right",
      render: (product) => (
        <span className="text-sm tabular-nums text-ink">{formatVND(displayPrice(product))}</span>
      ),
    },
    {
      key: "stock",
      header: "Tồn kho",
      align: "right",
      render: (product) => {
        const stock = totalStock(product);
        return (
          <span className={cn("text-sm tabular-nums", stock <= 5 ? "text-red-700" : "text-ink")}>{stock}</span>
        );
      },
    },
    {
      key: "sold",
      header: "Đã bán",
      align: "right",
      render: (product) => <span className="text-sm tabular-nums text-ink-muted">{product.soldCount || 0}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (product) => (
        <Badge variant={product.isActive ? "success" : "muted"}>
          {product.isActive ? "Đang bán" : "Đã ẩn"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => toggleActive(product)}
            aria-label={product.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
          >
            {product.isActive ? <EyeSlash size={15} weight="light" /> : <Eye size={15} weight="light" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditing(product);
              setDialogOpen(true);
            }}
            aria-label="Sửa sản phẩm"
          >
            <PencilSimple size={15} weight="light" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleting(product)}
            aria-label="Xoá sản phẩm"
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
        title="Sản phẩm"
        description="Quản lý sản phẩm, phiên bản và tồn kho."
        action={
          <ButtonCTA
            icon={<Plus size={13} weight="light" />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            Thêm sản phẩm
          </ButtonCTA>
        }
      />

      <AdminToolbar search={search} onSearch={setSearch} placeholder="Tìm theo tên sản phẩm…">
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={data?.data || []}
        isLoading={isLoading}
        empty={{
          title: "Chưa có sản phẩm nào",
          description: "Thêm sản phẩm đầu tiên để bắt đầu bán hàng.",
        }}
      />

      {data?.meta?.totalPages > 1 && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} className="mt-10" />
      )}

      <ProductDialog
        product={editing}
        categories={categories}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xoá sản phẩm này?</DialogTitle>
            <DialogDescription>
              “{deleting?.name}” sẽ bị xoá vĩnh viễn. Nếu chỉ muốn tạm ngừng bán, hãy dùng nút ẩn sản phẩm.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Huỷ
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xoá vĩnh viễn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagePage;
