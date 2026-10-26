import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { CaretDown, Check, CaretUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ================================= Select ================================ */

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-11 w-full items-center justify-between gap-2 border-b border-ink/15 bg-transparent px-0 py-2",
      "text-sm text-ink transition-colors duration-400 ease-spring",
      "data-[placeholder]:text-ink-faint/70 focus:border-ink focus:outline-none disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretDown size={13} weight="light" className="shrink-0 text-ink-faint transition-transform duration-400" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        "relative z-50 max-h-80 min-w-[9rem] overflow-hidden rounded-md border border-ink/10 bg-white shadow-ambient",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        position === "popper" && "data-[side=bottom]:translate-y-1.5 data-[side=top]:-translate-y-1.5",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-ink-faint">
        <CaretUp size={12} weight="light" />
      </SelectPrimitive.ScrollUpButton>
      <SelectPrimitive.Viewport
        className={cn("p-1.5", position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]")}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-ink-faint">
        <CaretDown size={12} weight="light" />
      </SelectPrimitive.ScrollDownButton>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 pl-8 pr-3 text-sm text-ink outline-none",
      "transition-colors duration-300 focus:bg-ink/[0.05] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check size={13} weight="light" className="text-copper" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

export const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-3 py-2 text-[0.625rem] uppercase tracking-editorial text-ink-faint", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

/* ================================ Checkbox =============================== */

export const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-[18px] w-[18px] shrink-0 rounded-[3px] border border-ink/25 bg-transparent",
      "transition-all duration-300 ease-spring",
      "data-[state=checked]:border-ink data-[state=checked]:bg-ink data-[state=checked]:text-bone",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check size={11} weight="bold" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

/** Checkbox + nhan, dung nhieu trong sidebar loc san pham */
export const CheckboxField = ({ id, label, count, checked, onCheckedChange, className }) => (
  <label
    htmlFor={id}
    className={cn(
      "flex cursor-pointer items-center gap-3 py-1.5 text-sm text-ink-muted transition-colors duration-300 hover:text-ink",
      className,
    )}
  >
    <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
    <span className="flex-1">{label}</span>
    {count != null && <span className="text-xs text-ink-faint">{count}</span>}
  </label>
);

/* =============================== RadioGroup ============================== */

export const RadioGroup = React.forwardRef(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn("grid gap-3", className)} {...props} />
));
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "aspect-square h-[18px] w-[18px] shrink-0 rounded-full border border-ink/25",
      "transition-all duration-300 ease-spring data-[state=checked]:border-ink",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-ink" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = "RadioGroupItem";

/** The lua chon lon - dung cho phuong thuc thanh toan / dia chi */
export const RadioCard = ({ value, id, title, description, icon, disabled, className }) => (
  <label
    htmlFor={id}
    className={cn(
      "group relative flex cursor-pointer items-start gap-4 rounded-md border border-ink/12 p-4",
      "transition-all duration-500 ease-spring hover:border-ink/30",
      "has-[:checked]:border-ink has-[:checked]:bg-ink/[0.025]",
      disabled && "pointer-events-none opacity-45",
      className,
    )}
  >
    <RadioGroupItem value={value} id={id} disabled={disabled} className="mt-0.5" />
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-ink">
        {icon}
        {title}
      </div>
      {description && <p className="text-xs leading-relaxed text-ink-faint">{description}</p>}
    </div>
  </label>
);

/* ================================= Switch ================================ */

export const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-[22px] w-[38px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
      "transition-colors duration-400 ease-spring",
      "data-[state=checked]:bg-ink data-[state=unchecked]:bg-ink/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-[18px] w-[18px] rounded-full bg-white shadow-sm",
        "transition-transform duration-400 ease-spring",
        "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

/* ================================= Slider ================================ */

export const Slider = React.forwardRef(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center py-2", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-ink/12">
      <SliderPrimitive.Range className="absolute h-full bg-ink" />
    </SliderPrimitive.Track>
    {(props.value || props.defaultValue || [0]).map((_, i) => (
      <SliderPrimitive.Thumb
        key={i}
        className="block h-4 w-4 rounded-full border border-ink bg-bone shadow-sm transition-transform duration-300 ease-spring hover:scale-110 focus-visible:outline-none disabled:pointer-events-none"
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";
