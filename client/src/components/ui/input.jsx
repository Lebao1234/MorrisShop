import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/** O nhap dang duong ke - hop voi ngon ngu bien tap hon la khung bo goc */
export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-12 w-full border-0 border-b border-ink/15 bg-transparent px-0 py-3 text-sm text-ink",
      "placeholder:text-ink-faint/70 transition-colors duration-400 ease-spring",
      "focus:border-ink focus:outline-none focus:ring-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-red-600",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none border-0 border-b border-ink/15 bg-transparent px-0 py-3 text-sm text-ink",
      "placeholder:text-ink-faint/70 transition-colors duration-400 ease-spring",
      "focus:border-ink focus:outline-none focus:ring-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-[invalid=true]:border-red-600",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "block text-[0.625rem] font-medium uppercase tracking-editorial text-ink-faint",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

/** Nhom truong: nhan + input + thong bao loi */
export const Field = ({ label, error, hint, required, children, className }) => (
  <div className={cn("space-y-1.5", className)}>
    {label && (
      <Label>
        {label}
        {required && <span className="ml-1 text-copper">*</span>}
      </Label>
    )}
    {children}
    {error ? (
      <p className="text-xs text-red-700">{error}</p>
    ) : hint ? (
      <p className="text-xs text-ink-faint">{hint}</p>
    ) : null}
  </div>
);

export default Input;
