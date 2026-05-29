import { CaretDownIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ComposedSelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface ComposedSelectProps<T extends string | number> {
  /** Current selected value. `null` means no selection (or "all" when `nullLabel` provided). */
  value: T | null;
  /** Fires when a user picks an option. `null` is emitted for the "all" item when `nullLabel` is set. */
  onChange: (value: T | null) => void;
  options: ComposedSelectOption<T>[];
  /** When set, prepends a sentinel "all" item at the top that emits `null`. */
  nullLabel?: string;
  /** Trigger text shown when `value` is null and `nullLabel` is not set. */
  placeholder?: string;
  /** Dropdown side alignment. Default `"end"`. */
  align?: "start" | "center" | "end";
  /** Cap the trigger label width (px). Default 110. */
  maxLabelWidth?: number;
  /** Extra classes for the trigger button. */
  triggerClassName?: string;
  /** Extra classes for the dropdown content. */
  contentClassName?: string;
  disabled?: boolean;
}

export default function ComposedSelect<T extends string | number>({
  value,
  onChange,
  options,
  nullLabel,
  placeholder = "Select…",
  align = "end",
  maxLabelWidth = 110,
  triggerClassName,
  contentClassName,
  disabled = false,
}: ComposedSelectProps<T>) {
  const selected = value !== null ? options.find((o) => o.value === value) : undefined;
  const triggerLabel = selected?.label ?? nullLabel ?? placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn("h-8 gap-1.5 rounded-md px-2.5 text-[12px] font-medium", triggerClassName)}
        >
          <span className="truncate" style={{ maxWidth: maxLabelWidth }}>
            {triggerLabel}
          </span>
          <CaretDownIcon className="size-3 opacity-60" weight="bold" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("min-w-[180px]", contentClassName)}>
        {nullLabel && (
          <DropdownMenuItem onSelect={() => onChange(null)} className="text-[12.5px]">
            <span className={cn(value === null && "font-semibold text-primary")}>{nullLabel}</span>
          </DropdownMenuItem>
        )}
        {options.map((opt) => (
          <DropdownMenuItem key={String(opt.value)} onSelect={() => onChange(opt.value)} className="text-[12.5px]">
            <span className={cn(value === opt.value && "font-semibold text-primary")}>{opt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
