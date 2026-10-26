import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva } from "class-variance-authority";
import { Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ================================= Badge ================================= */

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-editorial ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-ink text-bone ring-ink",
        outline: "bg-transparent text-ink-muted ring-ink/15",
        copper: "bg-copper/12 text-copper-dark ring-copper/25",
        solid: "bg-copper text-white ring-copper",
        muted: "bg-ink/[0.05] text-ink-muted ring-transparent",
        success: "bg-emerald-500/12 text-emerald-800 ring-emerald-600/20",
        danger: "bg-red-500/10 text-red-800 ring-red-600/20",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);

/* =============================== Separator =============================== */

export const Separator = React.forwardRef(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-ink/10",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

/* ================================ Skeleton =============================== */

export const Skeleton = ({ className, ...props }) => (
  <div className={cn("animate-pulse rounded-sm bg-ink/[0.07]", className)} {...props} />
);

/* ================================= Avatar ================================ */

export const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
    {...props}
  />
));
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
));
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center bg-ink text-[0.625rem] font-medium uppercase tracking-widest text-bone",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";

/* ================================== Tabs ================================= */

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("flex items-center gap-8 border-b border-ink/10 overflow-x-auto no-scrollbar", className)}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative -mb-px whitespace-nowrap border-b border-transparent pb-4 pt-2 text-[0.6875rem] font-medium uppercase tracking-editorial",
      "text-ink-faint transition-colors duration-500 ease-spring hover:text-ink",
      "data-[state=active]:border-ink data-[state=active]:text-ink",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-8 focus-visible:outline-none animate-fade-rise", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

/* =============================== Accordion =============================== */

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b border-ink/10", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "group flex flex-1 items-center justify-between gap-4 py-5 text-left text-sm font-medium text-ink",
        "transition-colors duration-400 ease-spring hover:text-copper-dark",
        className,
      )}
      {...props}
    >
      {children}
      <Plus
        size={16}
        weight="light"
        className="shrink-0 text-ink-faint transition-transform duration-600 ease-spring group-data-[state=open]:rotate-45"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-6 pr-8 text-sm leading-relaxed text-ink-muted", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

/* ================================= Table ================================= */
/* Bang du lieu cho khu vuc admin - tu cuon ngang tren mobile */

export const Table = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full min-w-[46rem] border-collapse text-sm", className)} {...props} />
  </div>
);

export const THead = ({ className, ...props }) => (
  <thead className={cn("border-b border-ink/12", className)} {...props} />
);

export const TH = ({ className, ...props }) => (
  <th
    className={cn(
      "px-4 py-3.5 text-left text-[0.625rem] font-medium uppercase tracking-editorial text-ink-faint",
      className,
    )}
    {...props}
  />
);

export const TBody = ({ className, ...props }) => (
  <tbody className={cn("divide-y divide-ink/[0.07]", className)} {...props} />
);

export const TR = ({ className, ...props }) => (
  <tr className={cn("transition-colors duration-300 hover:bg-ink/[0.025]", className)} {...props} />
);

export const TD = ({ className, ...props }) => (
  <td className={cn("px-4 py-4 align-middle text-ink", className)} {...props} />
);

export { badgeVariants };
