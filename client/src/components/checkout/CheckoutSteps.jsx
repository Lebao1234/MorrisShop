import { Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const STEPS = ["Giỏ hàng", "Thông tin giao hàng", "Thanh toán", "Hoàn tất"];

/** Chi bao tien trinh dat hang - duong ke ngang mong, khong dung khung to */
export const CheckoutSteps = ({ current = 0, className }) => (
  <nav aria-label="Tiến trình đặt hàng" className={cn("w-full", className)}>
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.625rem] tabular-nums transition-all duration-600 ease-spring",
                  done && "bg-copper text-white",
                  active && "bg-ink text-bone",
                  !done && !active && "bg-ink/[0.06] text-ink-faint",
                )}
              >
                {done ? <Check size={11} weight="bold" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[0.625rem] uppercase tracking-editorial sm:block",
                  active ? "text-ink" : "text-ink-faint",
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 transition-colors duration-700",
                  index < current ? "bg-copper" : "bg-ink/12",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default CheckoutSteps;
