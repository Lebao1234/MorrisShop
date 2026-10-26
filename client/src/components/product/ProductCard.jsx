import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Plus } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  cn,
  displayPrice,
  originalPrice,
  discountPercent,
  isInStock,
  HOLD_LABELS,
} from "@/lib/utils";
import { Badge } from "@/components/ui/display";
import { Price, RatingStars } from "@/components/common";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { userApi } from "@/services/api";

const TAG_LABELS = {
  bestseller: "Bán chạy",
  new: "Mới",
  limited: "Giới hạn",
  combo: "Combo",
  gift: "Quà tặng",
};

export const ProductCard = ({ product, index = 0, priority = false }) => {
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);
  const addToCart = useCartStore((s) => s.add);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);

  const price = displayPrice(product);
  const original = originalPrice(product);
  const discount = discountPercent(product);
  const inStock = isInStock(product);
  const secondImage = product.images?.[1];
  const featureTag = (product.tags || []).find((t) => TAG_LABELS[t]);
  const wished = user?.wishlist?.some((id) => String(id) === String(product._id));

  /** Them nhanh: chon phien ban dau tien con hang */
  const handleQuickAdd = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const variant = product.variants?.find((v) => v.stock > 0);
    if (!variant) return;

    setAdding(true);
    try {
      await addToCart({ product, variant, quantity: 1 });
      toast.success(`Đã thêm ${product.name}`, { description: `Phiên bản ${variant.name}` });
      openDrawer();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      return;
    }
    try {
      const res = await userApi.toggleWishlist(product._id);
      patchUser({ wishlist: res.data.wishlist });
      toast.success(res.data.added ? "Đã lưu vào yêu thích" : "Đã bỏ khỏi yêu thích");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, delay: Math.min(index * 0.06, 0.42), ease: [0.32, 0.72, 0, 1] }}
      className="group/card gpu"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/san-pham/${product.slug}`} className="block">
        {/* Doppelrand: vo ngoai mong bao quanh khung anh */}
        <div className="relative bezel overflow-hidden">
          <div className="bezel-core relative aspect-[4/5] overflow-hidden bg-bone-warm">
            <img
              src={product.images?.[0]}
              alt={product.name}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-1200 ease-spring",
                hovered && secondImage ? "scale-105 opacity-0" : "scale-100 opacity-100",
                !inStock && "grayscale",
              )}
            />
            {secondImage && (
              <img
                src={secondImage}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-all duration-1200 ease-spring",
                  hovered ? "scale-100 opacity-100" : "scale-105 opacity-0",
                )}
              />
            )}

            {/* Nhan trang thai */}
            <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
              {discount > 0 && <Badge variant="solid">-{discount}%</Badge>}
              {featureTag && <Badge variant="default">{TAG_LABELS[featureTag]}</Badge>}
              {!inStock && <Badge variant="muted">Hết hàng</Badge>}
            </div>

            {/* Yeu thich */}
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={wished ? "Bỏ khỏi yêu thích" : "Lưu vào yêu thích"}
              className={cn(
                "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full",
                "bg-white/80 text-ink backdrop-blur-sm transition-all duration-500 ease-spring",
                "hover:bg-ink hover:text-bone",
                "opacity-0 group-hover/card:opacity-100 focus-visible:opacity-100",
                wished && "opacity-100 text-copper",
              )}
            >
              <Heart size={15} weight={wished ? "fill" : "light"} />
            </button>

            {/* Them nhanh - truot len tu day anh */}
            {inStock && (
              <div
                className={cn(
                  "absolute inset-x-3 bottom-3 transition-all duration-600 ease-spring",
                  hovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={adding}
                  className="group/add flex w-full items-center justify-between rounded-full bg-ink/92 py-2 pl-5 pr-1.5 text-bone backdrop-blur-sm transition-colors duration-400 hover:bg-ink disabled:opacity-60"
                >
                  <span className="text-[0.625rem] font-medium uppercase tracking-editorial">
                    {adding ? "Đang thêm" : "Thêm nhanh"}
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/12 transition-transform duration-500 ease-spring group-hover/add:scale-110">
                    <Plus size={12} weight="light" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Thong tin */}
        <div className="mt-4 space-y-1.5 px-1">
          <p className="text-[0.625rem] uppercase tracking-editorial text-ink-faint">
            {product.category?.name || HOLD_LABELS[product.holdLevel]}
          </p>
          <h3 className="font-display text-lg font-normal leading-snug text-ink transition-colors duration-400 group-hover/card:text-copper-dark">
            {product.name}
          </h3>
          {product.numReviews > 0 && (
            <RatingStars value={product.ratingsAverage} count={product.numReviews} size={11} />
          )}
          <Price value={price} original={original} />
        </div>
      </Link>
    </motion.article>
  );
};

export default ProductCard;
