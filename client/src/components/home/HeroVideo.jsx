import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "@phosphor-icons/react";
import { ButtonCTA } from "@/components/ui/button";
import { MaskedLines } from "@/components/common/Reveal";

/**
 * Hero video toan man hinh theo bo cuc "Editorial Split":
 * khoi chu lon lech trai, thong tin phu neo o day ben phai.
 */
export const HeroVideo = ({ banner }) => {
  const sectionRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  // Parallax nhe: chi dich chuyen bang transform
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const isVideo = banner?.type === "hero_video";
  const eyebrow = banner?.eyebrow || "Bộ sưu tập 2026";
  const title = banner?.title || "Kết cấu làm nên phong thái";
  const subtitle =
    banner?.subtitle ||
    "Sáp vuốt tóc thủ công từng mẻ nhỏ, phối chế tại Hà Nội. Không bóng giả, không bết tóc — chỉ là kết cấu đúng.";
  const ctaLabel = banner?.ctaLabel || "Khám phá bộ sưu tập";
  const linkUrl = banner?.linkUrl || "/shop";

  const titleLines = title.split(" ").length > 3
    ? [title.split(" ").slice(0, Math.ceil(title.split(" ").length / 2)).join(" "),
       title.split(" ").slice(Math.ceil(title.split(" ").length / 2)).join(" ")]
    : [title];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-ink"
      aria-label="Giới thiệu bộ sưu tập"
    >
      {/* Lop media */}
      <motion.div style={{ y: mediaY }} className="absolute inset-0 gpu">
        {banner?.posterUrl && (
          <img
            src={banner.posterUrl}
            alt=""
            aria-hidden="true"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1200 ${
              videoReady && isVideo ? "opacity-0" : "opacity-100"
            }`}
          />
        )}
        {isVideo && banner?.mediaUrl && (
          <video
            src={banner.mediaUrl}
            poster={banner.posterUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {!isVideo && banner?.mediaUrl && (
          <img src={banner.mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}

        {/* Do bong theo phuong dung + xien de chu luon doc duoc */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-transparent to-transparent" />
      </motion.div>

      {/* Noi dung */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container relative flex min-h-[100dvh] flex-col justify-end pb-16 pt-32 gpu md:pb-22"
      >
        <div className="max-w-[46rem]">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="eyebrow border-bone/25 text-bone/70"
          >
            {eyebrow}
          </motion.span>

          <MaskedLines
            lines={titleLines}
            delay={0.34}
            className="mt-7"
            lineClassName="font-display text-display-lg font-normal text-bone"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="mt-8 max-w-lg text-base leading-relaxed text-bone/70 text-pretty"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.82, ease: [0.32, 0.72, 0, 1] }}
            className="mt-11 flex flex-wrap items-center gap-4"
          >
            <ButtonCTA variant="light" size="lg" asChild>
              <Link to={linkUrl}>{ctaLabel}</Link>
            </ButtonCTA>
            <Link
              to="/about"
              className="link-editorial px-2 text-bone/70 transition-colors duration-400 hover:text-bone"
            >
              Câu chuyện thương hiệu
            </Link>
          </motion.div>
        </div>

        {/* Chi bao cuon + thong tin phu, neo day phai */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-16 flex items-end justify-between gap-8 border-t border-bone/12 pt-7"
        >
          <span className="flex items-center gap-3 text-[0.625rem] uppercase tracking-editorial text-bone/50">
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
              className="inline-flex"
            >
              <ArrowDown size={13} weight="light" />
            </motion.span>
            Cuộn để khám phá
          </span>
          <div className="hidden gap-10 text-right sm:flex">
            <div>
              <p className="font-display text-2xl text-bone">7</p>
              <p className="text-[0.625rem] uppercase tracking-wideish text-bone/45">Kết cấu</p>
            </div>
            <div>
              <p className="font-display text-2xl text-bone">100%</p>
              <p className="text-[0.625rem] uppercase tracking-wideish text-bone/45">Gốc nước</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroVideo;
