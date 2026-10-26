import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Nut bam theo ngon ngu Editorial Luxury.
 * Moi chuyen dong dung duong cong spring rieng, khong dung ease-in-out mac dinh.
 */
const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-500 ease-spring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.985] select-none",
  {
    variants: {
      variant: {
        default: "bg-ink text-bone hover:bg-ink-soft",
        copper: "bg-copper text-white hover:bg-copper-dark",
        outline: "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-bone",
        ghost: "bg-transparent text-ink hover:bg-ink/[0.06]",
        subtle: "bg-ink/[0.05] text-ink hover:bg-ink/[0.09]",
        light: "bg-bone text-ink hover:bg-white",
        destructive: "bg-red-700 text-white hover:bg-red-800",
        link: "text-ink underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-[0.6875rem] uppercase tracking-wideish",
        default: "h-11 px-6 text-[0.75rem] uppercase tracking-wideish",
        lg: "h-14 px-9 text-[0.8125rem] uppercase tracking-wideish",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
      shape: {
        pill: "rounded-full",
        square: "rounded-none",
        soft: "rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default", shape: "pill" },
  },
);

export const Button = React.forwardRef(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

/**
 * CTA chinh: icon nam trong vong tron rieng, ap sat le phai cua nut
 * ("button-in-button"), va truot cheo khi hover de tao luc cang noi tai.
 */
export const ButtonCTA = React.forwardRef(
  (
    { className, children, icon, variant = "default", size = "default", asChild = false, ...props },
    ref,
  ) => {
    const iconTone =
      variant === "default" || variant === "copper" || variant === "destructive"
        ? "bg-white/12"
        : "bg-ink/[0.07]";

    /** Nhan + vong tron chua icon - luon di cung nhau */
    const decorate = (label) => (
      <>
        <span className="pl-2">{label}</span>
        <span
          className={cn(
            "ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-spring",
            "group-hover:translate-x-1 group-hover:-translate-y-px group-hover:scale-105",
            iconTone,
          )}
          aria-hidden="true"
        >
          {icon || <ArrowGlyph />}
        </span>
      </>
    );

    const shared = {
      ref,
      variant,
      size,
      className: cn("pr-1.5", className),
      ...props,
    };

    /*
     * Voi asChild, Radix Slot chi nhan dung mot phan tu con. Neu truyen thang
     * nhan + icon vao se loi "Slot failed to slot onto its children", nen ta
     * chen chung vao ben trong phan tu con (thuong la <Link/>).
     */
    if (asChild) {
      const child = React.Children.only(children);
      return (
        <Button {...shared} asChild>
          {React.cloneElement(child, undefined, decorate(child.props.children))}
        </Button>
      );
    }

    return <Button {...shared}>{decorate(children)}</Button>;
  },
);
ButtonCTA.displayName = "ButtonCTA";

/** Mui ten manh - khong dung icon net day mac dinh */
export const ArrowGlyph = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("h-3.5 w-3.5", className)}
  >
    <path d="M3.5 12.5 12.5 3.5M6 3.5h6.5V10" />
  </svg>
);

export { buttonVariants };
export default Button;
