import { useMemo, useState } from "react";
import { FunnelSimple, X } from "@phosphor-icons/react";
import { cn, formatVND, HOLD_LABELS, FINISH_LABELS } from "@/lib/utils";
import { CheckboxField, Slider, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/controls";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/overlay";
import { Badge } from "@/components/ui/display";

const PRICE_MAX = 1500000;

export const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "bestseller", label: "Bán chạy nhất" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "name", label: "Tên A → Z" },
];

const HAIR_TYPES = ["tóc thẳng", "tóc dày", "tóc cứng", "tóc mỏng", "tóc mềm", "tóc dài", "tóc xoăn", "tóc ngắn"];

/** Doi chuoi "a,b" trong URL thanh mang */
const toList = (value) => (value ? String(value).split(",").filter(Boolean) : []);

const FilterBlock = ({ title, children, className }) => (
  <div className={cn("border-b border-ink/10 py-7 first:pt-0", className)}>
    <h3 className="mb-4 text-[0.625rem] font-medium uppercase tracking-editorial text-ink">{title}</h3>
    {children}
  </div>
);

export const ProductFilters = ({ categories = [], filters, setFilters, clearFilters }) => {
  const selectedCategory = filters.category || "";
  const holdLevels = toList(filters.holdLevel);
  const finishes = toList(filters.finish);
  const hairTypes = toList(filters.hairType);

  const [priceRange, setPriceRange] = useState([
    Number(filters.minPrice) || 0,
    Number(filters.maxPrice) || PRICE_MAX,
  ]);

  const toggleInList = (key, list, value) => {
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    setFilters({ [key]: next });
  };

  const activeCount = useMemo(
    () =>
      (selectedCategory ? 1 : 0) +
      holdLevels.length +
      finishes.length +
      hairTypes.length +
      (filters.minPrice || filters.maxPrice ? 1 : 0) +
      (filters.inStock === "true" ? 1 : 0),
    [selectedCategory, holdLevels, finishes, hairTypes, filters],
  );

  return (
    <div className="space-y-0">
      {activeCount > 0 && (
        <div className="flex items-center justify-between border-b border-ink/10 pb-5">
          <Badge variant="outline">{activeCount} bộ lọc</Badge>
          <button
            type="button"
            onClick={clearFilters}
            className="link-editorial text-ink-faint hover:text-ink"
          >
            Xoá tất cả
          </button>
        </div>
      )}

      <FilterBlock title="Danh mục" className={activeCount > 0 ? "" : "pt-0"}>
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setFilters({ category: "" })}
            className={cn(
              "block w-full py-1.5 text-left text-sm transition-colors duration-300",
              !selectedCategory ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            Tất cả sản phẩm
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setFilters({ category: cat.slug })}
              className={cn(
                "block w-full py-1.5 text-left text-sm transition-colors duration-300",
                selectedCategory === cat.slug ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {selectedCategory === cat.slug && <span className="mr-2 text-copper">—</span>}
              {cat.name}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Mức giá">
        <Slider
          min={0}
          max={PRICE_MAX}
          step={50000}
          value={priceRange}
          onValueChange={setPriceRange}
          onValueCommit={([min, max]) =>
            setFilters({ minPrice: min || "", maxPrice: max >= PRICE_MAX ? "" : max })
          }
          className="mt-1"
        />
        <div className="mt-3 flex items-center justify-between text-xs tabular-nums text-ink-muted">
          <span>{formatVND(priceRange[0])}</span>
          <span>{priceRange[1] >= PRICE_MAX ? `${formatVND(PRICE_MAX)}+` : formatVND(priceRange[1])}</span>
        </div>
      </FilterBlock>

      <FilterBlock title="Độ giữ nếp">
        {Object.entries(HOLD_LABELS).map(([value, label]) => (
          <CheckboxField
            key={value}
            id={`hold-${value}`}
            label={label}
            checked={holdLevels.includes(value)}
            onCheckedChange={() => toggleInList("holdLevel", holdLevels, value)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Kết thúc">
        {Object.entries(FINISH_LABELS).map(([value, label]) => (
          <CheckboxField
            key={value}
            id={`finish-${value}`}
            label={label}
            checked={finishes.includes(value)}
            onCheckedChange={() => toggleInList("finish", finishes, value)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Loại tóc">
        {HAIR_TYPES.map((value) => (
          <CheckboxField
            key={value}
            id={`hair-${value}`}
            label={value.charAt(0).toUpperCase() + value.slice(1)}
            checked={hairTypes.includes(value)}
            onCheckedChange={() => toggleInList("hairType", hairTypes, value)}
          />
        ))}
      </FilterBlock>

      <FilterBlock title="Tình trạng">
        <CheckboxField
          id="in-stock"
          label="Chỉ hiện sản phẩm còn hàng"
          checked={filters.inStock === "true"}
          onCheckedChange={(checked) => setFilters({ inStock: checked ? "true" : "" })}
        />
      </FilterBlock>
    </div>
  );
};

/** Thanh cong cu tren luoi san pham: so ket qua + sap xep + nut loc cho mobile */
export const ProductToolbar = ({ total, filters, setFilters, filterPanel, className }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <p className="text-[0.6875rem] uppercase tracking-wideish text-ink-faint">
        {total != null ? `${total} sản phẩm` : " "}
      </p>

      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden">
              <FunnelSimple size={14} weight="light" />
              Bộ lọc
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm">
            <SheetHeader>
              <SheetTitle>Bộ lọc sản phẩm</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-6">{filterPanel}</div>
            <div className="border-t border-ink/10 p-5">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Xem kết quả
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Select
          value={filters.sort || "newest"}
          onValueChange={(value) => setFilters({ sort: value })}
        >
          <SelectTrigger className="h-9 w-[9.5rem] border-b-0 text-[0.6875rem] uppercase tracking-wideish">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

/** Cac chip hien thi bo loc dang ap dung */
export const ActiveFilterChips = ({ filters, setFilters, categories = [] }) => {
  const chips = [];

  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category);
    chips.push({ key: "category", label: cat?.name || filters.category, clear: { category: "" } });
  }
  toList(filters.holdLevel).forEach((v) =>
    chips.push({
      key: `hold-${v}`,
      label: HOLD_LABELS[v],
      clear: { holdLevel: toList(filters.holdLevel).filter((x) => x !== v) },
    }),
  );
  toList(filters.finish).forEach((v) =>
    chips.push({
      key: `finish-${v}`,
      label: FINISH_LABELS[v],
      clear: { finish: toList(filters.finish).filter((x) => x !== v) },
    }),
  );
  toList(filters.hairType).forEach((v) =>
    chips.push({
      key: `hair-${v}`,
      label: v,
      clear: { hairType: toList(filters.hairType).filter((x) => x !== v) },
    }),
  );
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: "price",
      label: `${formatVND(filters.minPrice || 0)} – ${formatVND(filters.maxPrice || PRICE_MAX)}`,
      clear: { minPrice: "", maxPrice: "" },
    });
  }
  if (filters.search) {
    chips.push({ key: "search", label: `“${filters.search}”`, clear: { search: "" } });
  }

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => setFilters(chip.clear)}
          className="group flex items-center gap-2 rounded-full bg-ink/[0.05] py-1.5 pl-3.5 pr-2.5 text-xs text-ink-muted transition-colors duration-400 hover:bg-ink hover:text-bone"
        >
          {chip.label}
          <X size={11} weight="light" />
        </button>
      ))}
    </div>
  );
};

export default ProductFilters;
