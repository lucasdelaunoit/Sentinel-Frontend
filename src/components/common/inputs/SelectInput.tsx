import { CaretDownIcon } from "@phosphor-icons/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SelectInputProps extends Omit<ComponentProps<"select">, "children"> {
  children: ReactNode;
}

export default function SelectInput({ className, children, ...props }: SelectInputProps) {
  return (
    <div className="relative w-full">
      <select
        data-slot="select"
        className={cn(
          "h-10 w-full min-w-0 appearance-none rounded-md border border-border bg-transparent px-2.5 pr-8 py-1 text-sm transition-colors outline-none cursor-pointer focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 dark:bg-input/30",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
    </div>
  );
}
