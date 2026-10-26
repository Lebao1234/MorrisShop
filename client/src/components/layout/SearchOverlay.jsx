import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlass, X, ArrowRight } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/services/api";
import { useDebounce, useLockBody } from "@/hooks";
import { displayPrice, formatVND } from "@/lib/utils";

const QUICK_LINKS = [
  { label: "Sáp giữ nếp cao", to: "/shop?holdLevel=high,extreme" },
  { label: "Kết thúc mờ", to: "/shop?finish=matte" },
  { label: "Cho tóc mỏng", to: "/shop?hairType=tóc mỏng" },
  { label: "Combo tiết kiệm", to: "/shop?category=combo-cham-soc" },
];

export const SearchOverlay = ({ open, onClose }) => {
  const [term, setTerm] = useState("");
  const debounced = useDebounce(term, 300);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  useLockBody(open);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
    else setTerm("");
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const { data, isFetching } = useQuery({
    queryKey: ["search-suggestions", debounced],
    queryFn: () => productApi.suggestions(debounced),
    enabled: open && debounced.trim().length >= 2,
    select: (res) => res.data,
  });

  const submit = (e) => {
    e.preventDefault();
    if (!term.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(term.trim())}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-[70] bg-bone/94 backdrop-blur-3xl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors duration-400 hover:bg-ink/[0.07] md:right-8 md:top-8"
          >
            <X size={18} weight="light" />
          </button>

          <div className="mx-auto flex h-full max-w-3xl flex-col px-6 pt-28 md:pt-36">
            <motion.form
              onSubmit={submit}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
              className="flex items-center gap-4 border-b border-ink/20 pb-5"
            >
              <MagnifyingGlass size={22} weight="light" className="shrink-0 text-ink-faint" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Tìm sáp, pomade, dầu gội…"
                className="w-full bg-transparent font-display text-2xl font-normal text-ink placeholder:text-ink-faint/60 focus:outline-none md:text-3xl"
                aria-label="Từ khoá tìm kiếm"
              />
            </motion.form>

            <div className="mt-10 flex-1 overflow-y-auto pb-16">
              {debounced.trim().length < 2 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.14 }}
                >
                  <p className="mb-5 text-[0.625rem] uppercase tracking-editorial text-ink-faint">
                    Gợi ý phổ biến
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {QUICK_LINKS.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className="rounded-full border border-ink/12 px-4 py-2 text-sm text-ink-muted transition-all duration-400 ease-spring hover:border-ink hover:bg-ink hover:text-bone"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : isFetching ? (
                <p className="text-sm text-ink-faint">Đang tìm…</p>
              ) : data?.length ? (
                <ul className="space-y-1">
                  {data.map((product, i) => (
                    <motion.li
                      key={product._id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.045, ease: [0.32, 0.72, 0, 1] }}
                    >
                      <Link
                        to={`/san-pham/${product.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-5 rounded-md p-3 transition-colors duration-400 hover:bg-ink/[0.04]"
                      >
                        <div className="h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-bone-warm">
                          <img
                            src={product.images?.[0]}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-700 ease-spring group-hover:scale-105"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-lg text-ink">{product.name}</p>
                          <p className="text-sm text-ink-muted">{formatVND(displayPrice(product))}</p>
                        </div>
                        <ArrowRight
                          size={16}
                          weight="light"
                          className="shrink-0 text-ink-faint transition-transform duration-500 ease-spring group-hover:translate-x-1"
                        />
                      </Link>
                    </motion.li>
                  ))}
                  <li className="pt-4">
                    <button
                      type="button"
                      onClick={submit}
                      className="link-editorial text-copper-dark"
                    >
                      Xem tất cả kết quả cho “{debounced}”
                    </button>
                  </li>
                </ul>
              ) : (
                <div className="py-10">
                  <p className="font-display text-2xl text-ink">Không tìm thấy sản phẩm nào</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Thử từ khoá khác, hoặc xem toàn bộ bộ sưu tập.
                  </p>
                  <Link to="/shop" onClick={onClose} className="link-editorial mt-6 inline-block text-copper-dark">
                    Xem cửa hàng
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
