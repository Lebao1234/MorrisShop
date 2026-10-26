import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Star, CaretLeft, CaretRight, SpinnerGap } from "@phosphor-icons/react";
import { cn, formatVND } from "@/lib/utils";
import { Skeleton } from "@/components/ui/display";
import { ButtonCTA } from "@/components/ui/button";

/* ================================== SEO ================================== */

export const SEO = ({ title, description, image, type = "website", noIndex }) => {
  const fullTitle = title ? `${title} — MORRIS` : "MORRIS — Sáp vuốt tóc thủ công cho quý ông";
  const desc =
    description ||
    "Sáp vuốt tóc, pomade và sản phẩm chăm sóc tóc nam được phối chế thủ công tại Hà Nội. Giữ nếp thật, gội sạch trong một lần.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
    </Helmet>
  );
};

/* ================================ Tieu de ================================= */

/** Tieu de khoi bien tap: eyebrow nho + tieu de serif lon */
export const SectionHeading = ({ eyebrow, title, description, action, align = "left", className }) => (
  <div
    className={cn(
      "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
      align === "center" && "md:flex-col md:items-center md:text-center",
      className,
    )}
  >
    <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
      {eyebrow && <span className="eyebrow mb-5">{eyebrow}</span>}
      <h2 className="font-display text-display-sm font-normal text-balance text-ink">{title}</h2>
      {description && (
        <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-ink-muted text-pretty">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/* ================================= Rating ================================= */

export const RatingStars = ({ value = 0, size = 13, showValue, count, className }) => (
  <div className={cn("flex items-center gap-1.5", className)}>
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          weight={value >= star - 0.5 ? "fill" : "light"}
          className={value >= star - 0.5 ? "text-copper" : "text-ink/22"}
        />
      ))}
    </div>
    {showValue && value > 0 && <span className="text-xs text-ink-muted">{value.toFixed(1)}</span>}
    {count != null && <span className="text-xs text-ink-faint">({count})</span>}
  </div>
);

/* ================================== Gia ================================== */

export const Price = ({ value, original, size = "default", className }) => {
  const sizes = {
    sm: "text-[0.8125rem]",
    default: "text-[0.9375rem]",
    lg: "text-xl",
    xl: "font-display text-3xl",
  };
  return (
    <span className={cn("inline-flex items-baseline gap-2.5 tabular-nums", className)}>
      <span className={cn("font-medium text-ink", sizes[size])}>{formatVND(value)}</span>
      {original > 0 && original > value && (
        <span className="text-xs text-ink-faint line-through">{formatVND(original)}</span>
      )}
    </span>
  );
};

/* ================================= Loader ================================= */

export const Loader = ({ className, label }) => (
  <div className={cn("flex flex-col items-center justify-center gap-4 py-24", className)}>
    <SpinnerGap size={22} weight="light" className="animate-spin text-copper" />
    {label && <p className="text-[0.6875rem] uppercase tracking-editorial text-ink-faint">{label}</p>}
  </div>
);

export const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Loader label="Đang tải" />
  </div>
);

/* =============================== EmptyState =============================== */

export const EmptyState = ({ icon, title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center px-6 py-24 text-center", className)}>
    {icon && (
      <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-ink/[0.045] text-ink-faint">
        {icon}
      </div>
    )}
    <h3 className="font-display text-2xl font-normal text-ink">{title}</h3>
    {description && <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">{description}</p>}
    {action && <div className="mt-8">{action}</div>}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <EmptyState
    title="Không tải được dữ liệu"
    description={message || "Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối và thử lại."}
    action={
      onRetry && (
        <ButtonCTA variant="outline" onClick={onRetry}>
          Thử lại
        </ButtonCTA>
      )
    }
  />
);

/* =============================== Pagination =============================== */

export const Pagination = ({ page, totalPages, onChange, className }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const window = 1;
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const btn =
    "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs transition-all duration-400 ease-spring disabled:opacity-30";

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="Phân trang">
      <button
        type="button"
        className={cn(btn, "text-ink-muted hover:bg-ink/[0.06]")}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        <CaretLeft size={13} weight="light" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-xs text-ink-faint">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              btn,
              p === page ? "bg-ink text-bone" : "text-ink-muted hover:bg-ink/[0.06]",
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={cn(btn, "text-ink-muted hover:bg-ink/[0.06]")}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
      >
        <CaretRight size={13} weight="light" />
      </button>
    </nav>
  );
};

/* =============================== Breadcrumb =============================== */

export const Breadcrumb = ({ items = [], className }) => (
  <nav className={cn("flex flex-wrap items-center gap-2 text-[0.6875rem] uppercase tracking-wideish", className)}>
    <Link to="/" className="text-ink-faint transition-colors hover:text-ink">
      Trang chủ
    </Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-2">
        <span className="text-ink/25">/</span>
        {item.to && i < items.length - 1 ? (
          <Link to={item.to} className="text-ink-faint transition-colors hover:text-ink">
            {item.label}
          </Link>
        ) : (
          <span className="text-ink">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

/* =============================== Skeletons =============================== */

export const ProductCardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[4/5] w-full" />
    <div className="space-y-2">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
