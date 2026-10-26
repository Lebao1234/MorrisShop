import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { CaretLeft, CaretRight, Drop, Leaf, HandSoap, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Reveal, RevealGroup, RevealItem, MaskedLines } from "@/components/common/Reveal";
import { SectionHeading } from "@/components/common";
import { ButtonCTA, ArrowGlyph } from "@/components/ui/button";
import ProductCard from "@/components/product/ProductCard";

/* ========================= Luoi bo suu tap bat doi xung ======================== */

/**
 * Bo cuc bento: the dau tien cao gap doi, hai the con lai xep chong ben phai.
 * Duoi 768px tat ca do ve mot cot.
 */
export const CollectionShowcase = ({ banners = [] }) => {
  if (!banners.length) return null;
  const [lead, ...rest] = banners;

  return (
    <section className="container py-24 md:py-30">
      <SectionHeading
        eyebrow="Bộ sưu tập"
        title="Ba dòng sản phẩm, một triết lý"
        description="Mỗi dòng được phát triển cho một nhu cầu cụ thể — chọn theo mái tóc của bạn, không phải theo xu hướng."
        action={
          <Link to="/shop" className="link-editorial text-ink-muted hover:text-ink">
            Xem tất cả
          </Link>
        }
      />

      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
        <Reveal className="md:col-span-7 md:row-span-2">
          <CollectionCard banner={lead} tall />
        </Reveal>
        {rest.slice(0, 2).map((banner, i) => (
          <Reveal key={banner._id} delay={0.1 * (i + 1)} className="md:col-span-5">
            <CollectionCard banner={banner} />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const CollectionCard = ({ banner, tall }) => (
  <Link
    to={banner.linkUrl || "/shop"}
    className={cn(
      "group relative block overflow-hidden rounded-bezel bg-ink",
      tall ? "aspect-[4/5] md:aspect-[9/10]" : "aspect-[16/10] md:aspect-[16/11]",
    )}
  >
    <img
      src={banner.mediaUrl}
      alt={banner.title}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-1200 ease-spring group-hover:scale-[1.045]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />

    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 md:p-9">
      <div>
        {banner.subtitle && (
          <p className="text-[0.625rem] uppercase tracking-editorial text-bone/60">{banner.subtitle}</p>
        )}
        <h3
          className={cn(
            "mt-2.5 font-display font-normal leading-tight text-bone",
            tall ? "text-4xl md:text-5xl" : "text-3xl",
          )}
        >
          {banner.title}
        </h3>
      </div>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bone/12 text-bone backdrop-blur-sm transition-all duration-600 ease-spring group-hover:bg-bone group-hover:text-ink">
        <ArrowGlyph className="h-4 w-4 transition-transform duration-600 ease-spring group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </div>
  </Link>
);

/* ============================ Slider ban chay ============================ */

export const ProductCarousel = ({ title, eyebrow, description, products = [], viewAllTo = "/shop" }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, dragFree: true });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((api) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return undefined;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!products.length) return null;

  const navButton =
    "flex h-10 w-10 items-center justify-center rounded-full border border-ink/12 text-ink transition-all duration-500 ease-spring hover:border-ink hover:bg-ink hover:text-bone disabled:opacity-25 disabled:hover:border-ink/12 disabled:hover:bg-transparent disabled:hover:text-ink";

  return (
    <section className="py-24 md:py-30">
      <div className="container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                className={navButton}
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
                aria-label="Sản phẩm trước"
              >
                <CaretLeft size={14} weight="light" />
              </button>
              <button
                type="button"
                className={navButton}
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
                aria-label="Sản phẩm tiếp theo"
              >
                <CaretRight size={14} weight="light" />
              </button>
            </div>
          }
        />
      </div>

      <div className="mt-14 overflow-hidden" ref={emblaRef}>
        <div className="container flex gap-5 md:gap-6">
          {products.map((product, i) => (
            <div
              key={product._id}
              className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_46%] lg:flex-[0_0_30%] xl:flex-[0_0_23.5%]"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      </div>

      <div className="container mt-12">
        <Link to={viewAllTo} className="link-editorial text-ink-muted hover:text-ink">
          Xem tất cả sản phẩm
        </Link>
      </div>
    </section>
  );
};

/* ============================== Khoi cau chuyen ============================= */

export const StorySection = ({ banner }) => {
  if (!banner) return null;

  return (
    <section className="relative overflow-hidden bg-bone-warm py-24 md:py-30">
      <div className="container grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Anh nghieng nhe, xep lop theo truc Z */}
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative">
            <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-bezel border border-ink/10 md:block" />
            <div className="relative overflow-hidden rounded-bezel bg-ink">
              <img
                src={banner.mediaUrl}
                alt={banner.title}
                loading="lazy"
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-7 -right-3 hidden bezel bg-bone shadow-ambient md:block">
              <div className="bezel-core px-7 py-5">
                <p className="font-display text-3xl text-ink">2019</p>
                <p className="mt-1 text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                  Mẻ sáp đầu tiên
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <span className="eyebrow">{banner.eyebrow || "Câu chuyện"}</span>
          </Reveal>
          <MaskedLines
            lines={(banner.title || "").split(" ").length > 4
              ? [banner.title.split(" ").slice(0, 3).join(" "), banner.title.split(" ").slice(3).join(" ")]
              : [banner.title]}
            className="mt-6"
            lineClassName="font-display text-display-sm font-normal text-ink"
          />
          <Reveal delay={0.15}>
            <p className="mt-7 max-w-lg text-[0.9375rem] leading-relaxed text-ink-muted text-pretty">
              {banner.subtitle}
            </p>
            <ButtonCTA variant="outline" className="mt-10" asChild>
              <Link to={banner.linkUrl || "/about"}>{banner.ctaLabel || "Đọc câu chuyện"}</Link>
            </ButtonCTA>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* =============================== Cam ket ============================== */

const PILLARS = [
  {
    Icon: Drop,
    title: "Gốc nước hoàn toàn",
    text: "Gội một lần là sạch, không để lại lớp dầu bám trên da đầu qua đêm.",
  },
  {
    Icon: Leaf,
    title: "Thành phần minh bạch",
    text: "Toàn bộ thành phần được in đầy đủ trên nhãn và trong trang sản phẩm.",
  },
  {
    Icon: HandSoap,
    title: "Phối chế thủ công",
    text: "Từng mẻ nhỏ được trộn và kiểm tra kết cấu bằng tay tại xưởng Hà Nội.",
  },
  {
    Icon: Sparkle,
    title: "Tạo kiểu lại trong ngày",
    text: "Làm ẩm tay và vuốt lại — kiểu tóc trở về nếp mà không cần thêm sản phẩm.",
  },
];

export const PillarsSection = () => (
  <section className="container py-24 md:py-30">
    <RevealGroup className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {PILLARS.map(({ Icon, title, text }) => (
        <RevealItem key={title}>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/[0.05] text-copper-dark">
            <Icon size={18} weight="light" />
          </div>
          <h3 className="mt-6 font-display text-xl font-normal text-ink">{title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{text}</p>
        </RevealItem>
      ))}
    </RevealGroup>
  </section>
);

/* ============================== Bang chay chu ============================= */

export const MarqueeStrip = ({ items = [] }) => {
  const list = items.length ? items : ["Miễn phí vận chuyển từ 500.000đ", "Đổi trả trong 7 ngày", "Phối chế tại Hà Nội", "Gốc nước — gội sạch một lần"];
  const doubled = [...list, ...list];

  return (
    <div className="overflow-hidden border-y border-ink/10 bg-bone-warm py-4">
      <div className="flex w-max animate-marquee items-center gap-14 gpu">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-14 text-[0.6875rem] uppercase tracking-editorial text-ink-muted">
            {item}
            <span className="h-1 w-1 rounded-full bg-copper" />
          </span>
        ))}
      </div>
    </div>
  );
};

/* ============================== Bang khuyen mai ============================ */

export const PromoBanner = ({ banner }) => {
  if (!banner) return null;
  return (
    <section className="container pb-24 md:pb-30">
      <Reveal>
        <Link to={banner.linkUrl || "/shop"} className="group relative block overflow-hidden rounded-bezel">
          <img
            src={banner.mediaUrl}
            alt={banner.title}
            loading="lazy"
            className="aspect-[21/9] w-full object-cover transition-transform duration-1200 ease-spring group-hover:scale-[1.03] md:aspect-[3/1]"
          />
          <div className="absolute inset-0 bg-ink/55" />
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            {banner.eyebrow && (
              <span className="eyebrow border-bone/25 text-bone/70">{banner.eyebrow}</span>
            )}
            <h3 className="mt-5 max-w-2xl font-display text-3xl font-normal text-bone text-balance md:text-4xl">
              {banner.title}
            </h3>
            {banner.subtitle && (
              <p className="mt-3 max-w-md text-sm text-bone/65">{banner.subtitle}</p>
            )}
          </motion.div>
        </Link>
      </Reveal>
    </section>
  );
};
