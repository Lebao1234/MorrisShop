import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Hieu ung vao khung nhin: mo dan + truot len + go blur.
 * Chi dung transform/opacity/filter nen khong gay reflow.
 */
export const Reveal = ({
  children,
  className,
  delay = 0,
  y = 40,
  blur = true,
  once = true,
  amount = 0.25,
  as = "div",
}) => {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={cn("gpu", className)}
      initial={{ opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </MotionTag>
  );
};

/** Cha cua danh sach - cac phan tu con xuat hien lech nhip nhau */
export const RevealGroup = ({ children, className, stagger = 0.08, delay = 0, once = true }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once, amount: 0.15 }}
    variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
  >
    {children}
  </motion.div>
);

export const RevealItem = ({ children, className, y = 32 }) => (
  <motion.div
    className={cn("gpu", className)}
    variants={{
      hidden: { opacity: 0, y, filter: "blur(6px)" },
      show: { opacity: 1, y: 0, filter: "blur(0px)" },
    }}
    transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
  >
    {children}
  </motion.div>
);

/**
 * Chu lon xuat hien tung dong, lo ra tu mot khung an.
 *
 * Quan trong: khong dung `whileInView` tren chinh dong chu. Dong chu bat dau o
 * duoi khung mask `overflow-hidden` nen bi cat hoan toan, va IntersectionObserver
 * tinh ca vung cat cua to tien - no se luon bao "ngoai khung nhin" va hieu ung
 * khong bao gio chay. Vi vay ta quan sat khung ngoai (khong bi cat) roi moi
 * dieu khien chuyen dong cua tung dong.
 */
export const MaskedLines = ({ lines = [], className, lineClassName, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden">
          <motion.div
            className={cn("gpu", lineClassName)}
            initial={{ y: "108%" }}
            animate={inView ? { y: "0%" } : { y: "108%" }}
            transition={{ duration: 1.05, delay: delay + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default Reveal;
