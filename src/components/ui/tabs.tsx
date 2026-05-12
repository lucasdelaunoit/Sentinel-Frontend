import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Tabs({ className, orientation = "horizontal", ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center text-muted-foreground group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        pill: "h-auto gap-2 bg-transparent p-0",
        segmented:
          "justify-center rounded-lg p-[3px] bg-muted group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit",
        line: "justify-center rounded-none gap-1 bg-transparent p-[3px] group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit",
      },
    },
    defaultVariants: {
      variant: "pill",
    },
  },
);

function TabsList({
  className,
  variant = "pill",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "cursor-pointer relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // pill variant (default): independent rounded button per tab, no shared container bg
        "group-data-[variant=pill]/tabs-list:px-5 group-data-[variant=pill]/tabs-list:py-2 group-data-[variant=pill]/tabs-list:rounded-xl group-data-[variant=pill]/tabs-list:text-[13px] group-data-[variant=pill]/tabs-list:bg-card group-data-[variant=pill]/tabs-list:text-foreground group-data-[variant=pill]/tabs-list:hover:bg-primary group-data-[variant=pill]/tabs-list:hover:text-background group-data-[variant=pill]/tabs-list:data-active:bg-primary group-data-[variant=pill]/tabs-list:data-active:text-primary-foreground group-data-[variant=pill]/tabs-list:data-active:border-transparent group-data-[variant=pill]/tabs-list:data-active:shadow-sm group-data-[variant=pill]/tabs-list:data-active:shadow-primary/20",
        // segmented variant (legacy default)
        "group-data-[variant=segmented]/tabs-list:h-[calc(100%-1px)] group-data-[variant=segmented]/tabs-list:flex-1 group-data-[variant=segmented]/tabs-list:rounded-md group-data-[variant=segmented]/tabs-list:border group-data-[variant=segmented]/tabs-list:border-transparent group-data-[variant=segmented]/tabs-list:px-1.5 group-data-[variant=segmented]/tabs-list:py-0.5 group-data-[variant=segmented]/tabs-list:text-sm group-data-[variant=segmented]/tabs-list:text-foreground/60 group-data-[variant=segmented]/tabs-list:hover:text-foreground group-data-[variant=segmented]/tabs-list:data-active:bg-background group-data-[variant=segmented]/tabs-list:data-active:text-foreground group-data-[variant=segmented]/tabs-list:data-active:shadow-sm dark:group-data-[variant=segmented]/tabs-list:text-muted-foreground dark:group-data-[variant=segmented]/tabs-list:hover:text-foreground dark:group-data-[variant=segmented]/tabs-list:data-active:border-input dark:group-data-[variant=segmented]/tabs-list:data-active:bg-input/30 dark:group-data-[variant=segmented]/tabs-list:data-active:text-foreground",
        // line variant
        "group-data-[variant=line]/tabs-list:h-[calc(100%-1px)] group-data-[variant=line]/tabs-list:flex-1 group-data-[variant=line]/tabs-list:px-1.5 group-data-[variant=line]/tabs-list:py-0.5 group-data-[variant=line]/tabs-list:text-sm group-data-[variant=line]/tabs-list:text-foreground/60 group-data-[variant=line]/tabs-list:hover:text-foreground group-data-[variant=line]/tabs-list:bg-transparent",
        // line underline indicator
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
