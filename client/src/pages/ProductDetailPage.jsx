import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Minus, Plus, Truck, ArrowsClockwise, ShieldCheck, ChatCircle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { productApi, reviewApi } from "@/services/api";
import {
  cn,
  formatVND,
  variantPrice,
  HOLD_LABELS,
  FINISH_LABELS,
  formatDate,
  initials,
} from "@/lib/utils";
import { SEO, Breadcrumb, PageLoader, RatingStars, EmptyState, ErrorState } from "@/components/common";
import { Reveal } from "@/components/common/Reveal";
import { Badge, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Avatar, AvatarFallback } from "@/components/ui/display";
import { Button, ButtonCTA } from "@/components/ui/button";
import { usePointerPosition } from "@/hooks";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { userApi } from "@/services/api";
import ProductCard from "@/components/product/ProductCard";
import ReviewForm from "@/components/product/ReviewForm";

/* ------------------------------ Thu vien anh ----------------------------- */

const Gallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const { ref, position, onPointerMove } = usePointerPosition();

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Anh nho - ngang tren mobile, doc tren desktop */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar md:w-20 md:flex-col md:overflow-visible">
        {images.map((image, i) => (
          <button
            key={image + i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Xem ảnh ${i + 1}`}
            className={cn(
              "relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-sm transition-all duration-500 ease-spring md:w-full",
              active === i ? "ring-1 ring-ink" : "opacity-55 hover:opacity-100",
            )}
          >
            <img src={image} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="flex-1 bezel">
        <div
          ref={ref}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onPointerMove}
          className="bezel-core relative aspect-[4/5] overflow-hidden bg-bone-warm"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={images[active]}
              alt={`${name} — ảnh ${active + 1}`}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0 h-full w-full object-cover gpu"
              style={
                zoom
                  ? { transform: "scale(1.7)", transformOrigin: `${position.x}% ${position.y}%` }
                  : undefined
              }
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ Danh gia ------------------------------ */

const ReviewsPanel = ({ product }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reviews", product._id, page],
    queryFn: () => reviewApi.byProduct(product._id, { page, limit: 5 }),
  });

  const reviews = data?.data || [];
  const breakdown = data?.meta?.breakdown || {};
  const total = data?.meta?.total || 0;

  return (
    <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
      <div>
        <div className="bezel">
          <div className="bezel-core px-7 py-8 text-center">
            <p className="font-display text-5xl text-ink">{(product.ratingsAverage || 0).toFixed(1)}</p>
            <RatingStars value={product.ratingsAverage} size={15} className="mt-3 justify-center" />
            <p className="mt-2.5 text-xs text-ink-faint">{total} đánh giá</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star] || 0;
            const percent = total ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs text-ink-muted">
                <span className="w-3 tabular-nums">{star}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                  <div className="h-full rounded-full bg-copper" style={{ width: `${percent}%` }} />
                </div>
                <span className="w-6 text-right tabular-nums text-ink-faint">{count}</span>
              </div>
            );
          })}
        </div>

        <ReviewForm productId={product._id} onSuccess={refetch} className="mt-8" />
      </div>

      <div>
        {isLoading ? (
          <p className="text-sm text-ink-faint">Đang tải đánh giá…</p>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={<ChatCircle size={20} weight="light" />}
            title="Chưa có đánh giá nào"
            description="Hãy là người đầu tiên chia sẻ trải nghiệm của bạn với sản phẩm này."
            className="py-14"
          />
        ) : (
          <ul className="divide-y divide-ink/[0.08]">
            {reviews.map((review) => (
              <li key={review._id} className="py-7 first:pt-0">
                <div className="flex items-start gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials(review.user?.name || "?")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-medium text-ink">{review.user?.name}</span>
                      <span className="text-xs text-ink-faint">{formatDate(review.createdAt)}</span>
                    </div>
                    <RatingStars value={review.rating} size={12} className="mt-1.5" />
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">{review.comment}</p>
                    {review.images?.length > 0 && (
                      <div className="mt-4 flex gap-2.5">
                        {review.images.map((img) => (
                          <img
                            key={img}
                            src={img}
                            alt=""
                            className="h-20 w-20 rounded-sm object-cover"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                    {review.adminReply && (
                      <div className="mt-4 border-l-2 border-copper/40 pl-4">
                        <p className="text-[0.625rem] uppercase tracking-editorial text-copper-dark">
                          Phản hồi từ Morris
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{review.adminReply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {data?.meta?.totalPages > 1 && (
          <div className="mt-8 flex gap-3">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------ Trang chinh ------------------------------ */

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const [variantSku, setVariantSku] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const addToCart = useCartStore((s) => s.add);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productApi.detail(slug),
    select: (res) => res.data,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related", product?._id],
    queryFn: () => productApi.related(product._id, 4),
    select: (res) => res.data,
    enabled: Boolean(product?._id),
  });

  // Chon phien ban con hang dau tien khi doi san pham
  useEffect(() => {
    if (!product?.variants?.length) return;
    const firstAvailable = product.variants.find((v) => v.stock > 0) || product.variants[0];
    setVariantSku(firstAvailable.sku);
    setQuantity(1);
  }, [product?._id, product?.variants]);

  const variant = useMemo(
    () => product?.variants?.find((v) => v.sku === variantSku) || product?.variants?.[0],
    [product, variantSku],
  );

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const price = variantPrice(variant);
  const hasDiscount = variant?.salePrice > 0 && variant.salePrice < variant.price;
  const wished = user?.wishlist?.some((id) => String(id) === String(product._id));
  const maxQty = Math.max(1, variant?.stock || 1);

  const handleAdd = async () => {
    if (!variant || variant.stock === 0) return;
    setAdding(true);
    try {
      await addToCart({ product, variant, quantity });
      toast.success("Đã thêm vào giỏ hàng", { description: `${product.name} — ${variant.name}` });
      openDrawer();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) return toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
    try {
      const res = await userApi.toggleWishlist(product._id);
      patchUser({ wishlist: res.data.wishlist });
      toast.success(res.data.added ? "Đã lưu vào yêu thích" : "Đã bỏ khỏi yêu thích");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDescription}
        image={product.images?.[0]}
        type="product"
      />

      <div className="container pt-28 md:pt-36">
        <Breadcrumb
          items={[
            { label: "Cửa hàng", to: "/shop" },
            { label: product.category?.name, to: `/shop?category=${product.category?.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <section className="container grid gap-12 py-12 lg:grid-cols-2 lg:gap-20 lg:py-16">
        <Reveal y={24}>
          <div className="lg:sticky lg:top-28">
            <Gallery images={product.images} name={product.name} />
          </div>
        </Reveal>

        <Reveal delay={0.1} y={24}>
          <div className="max-w-lg">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{HOLD_LABELS[product.holdLevel]}</Badge>
              <Badge variant="outline">{FINISH_LABELS[product.finish]}</Badge>
              {product.tags?.includes("bestseller") && <Badge variant="copper">Bán chạy</Badge>}
            </div>

            <h1 className="mt-5 font-display text-display-sm font-normal leading-[1.08] text-ink">
              {product.name}
            </h1>

            {product.numReviews > 0 && (
              <button
                type="button"
                onClick={() => document.getElementById("tab-reviews")?.click()}
                className="mt-4 flex items-center gap-2"
              >
                <RatingStars value={product.ratingsAverage} size={13} showValue />
                <span className="text-xs text-ink-faint underline underline-offset-4">
                  {product.numReviews} đánh giá
                </span>
              </button>
            )}

            <p className="mt-6 text-[0.9375rem] leading-relaxed text-ink-muted text-pretty">
              {product.shortDescription}
            </p>

            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-display text-4xl tabular-nums text-ink">{formatVND(price)}</span>
              {hasDiscount && (
                <>
                  <span className="text-base text-ink-faint line-through">{formatVND(variant.price)}</span>
                  <Badge variant="solid">
                    -{Math.round(((variant.price - variant.salePrice) / variant.price) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {/* Chon phien ban */}
            {product.variants.length > 1 && (
              <div className="mt-10">
                <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                  Dung tích — <span className="text-ink">{variant?.name}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {product.variants.map((v) => (
                    <button
                      key={v.sku}
                      type="button"
                      onClick={() => {
                        setVariantSku(v.sku);
                        setQuantity(1);
                      }}
                      disabled={v.stock === 0}
                      className={cn(
                        "rounded-full border px-5 py-2.5 text-sm transition-all duration-500 ease-spring",
                        v.sku === variantSku
                          ? "border-ink bg-ink text-bone"
                          : "border-ink/15 text-ink hover:border-ink",
                        v.stock === 0 && "cursor-not-allowed line-through opacity-40 hover:border-ink/15",
                      )}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* So luong + them vao gio */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center rounded-full border border-ink/15">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition-colors duration-300 hover:bg-ink/[0.05] hover:text-ink disabled:opacity-30"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={13} weight="light" />
                </button>
                <span className="w-10 text-center text-sm tabular-nums text-ink">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition-colors duration-300 hover:bg-ink/[0.05] hover:text-ink disabled:opacity-30"
                  aria-label="Tăng số lượng"
                >
                  <Plus size={13} weight="light" />
                </button>
              </div>

              <ButtonCTA
                size="lg"
                className="flex-1"
                onClick={handleAdd}
                disabled={adding || !variant || variant.stock === 0}
              >
                {variant?.stock === 0 ? "Hết hàng" : adding ? "Đang thêm…" : "Thêm vào giỏ"}
              </ButtonCTA>

              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={handleWishlist}
                aria-label={wished ? "Bỏ khỏi yêu thích" : "Lưu vào yêu thích"}
              >
                <Heart size={16} weight={wished ? "fill" : "light"} className={wished ? "text-copper" : ""} />
              </Button>
            </div>

            {variant?.stock > 0 && variant.stock <= 10 && (
              <p className="mt-3.5 text-xs text-copper-dark">
                Chỉ còn {variant.stock} sản phẩm cho phiên bản này
              </p>
            )}

            <Separator className="my-9" />

            {/* Cam ket dich vu */}
            <ul className="space-y-3.5">
              {[
                { Icon: Truck, text: "Miễn phí vận chuyển cho đơn từ 500.000đ" },
                { Icon: ArrowsClockwise, text: "Đổi trả trong 7 ngày nếu chưa mở seal" },
                { Icon: ShieldCheck, text: "Hàng chính hãng, có tem chống giả" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-ink-muted">
                  <Icon size={16} weight="light" className="shrink-0 text-copper-dark" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Tab thong tin */}
      <section className="container pb-24 md:pb-30">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Mô tả</TabsTrigger>
            <TabsTrigger value="ingredients">Thành phần</TabsTrigger>
            <TabsTrigger value="how-to-use">Cách dùng</TabsTrigger>
            <TabsTrigger value="reviews" id="tab-reviews">
              Đánh giá ({product.numReviews || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <div className="grid gap-10 lg:grid-cols-[1fr_18rem] lg:gap-16">
              <p className="max-w-2xl whitespace-pre-line text-[0.9375rem] leading-loose text-ink-muted">
                {product.description || product.shortDescription}
              </p>
              <dl className="space-y-4 text-sm">
                {[
                  ["Thương hiệu", product.brand],
                  ["Độ giữ nếp", HOLD_LABELS[product.holdLevel]],
                  ["Kết thúc", FINISH_LABELS[product.finish]],
                  ["Loại tóc phù hợp", product.hairType?.join(", ")],
                  ["Danh mục", product.category?.name],
                ]
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-6 border-b border-ink/[0.08] pb-3">
                      <dt className="text-ink-faint">{label}</dt>
                      <dd className="text-right text-ink">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </TabsContent>

          <TabsContent value="ingredients">
            <p className="max-w-2xl text-[0.9375rem] leading-loose text-ink-muted">
              {product.ingredients || "Đang cập nhật thành phần chi tiết."}
            </p>
          </TabsContent>

          <TabsContent value="how-to-use">
            <p className="max-w-2xl whitespace-pre-line text-[0.9375rem] leading-loose text-ink-muted">
              {product.howToUse || "Đang cập nhật hướng dẫn sử dụng."}
            </p>
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsPanel product={product} />
          </TabsContent>
        </Tabs>
      </section>

      {/* San pham lien quan */}
      {related.length > 0 && (
        <section className="border-t border-ink/10 py-24 md:py-30">
          <div className="container">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-display-sm font-normal text-ink">Có thể bạn cũng thích</h2>
              <Link to="/shop" className="link-editorial shrink-0 text-ink-muted hover:text-ink">
                Xem tất cả
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
              {related.map((item, i) => (
                <ProductCard key={item._id} product={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ProductDetailPage;
