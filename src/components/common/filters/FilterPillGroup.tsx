import { cn } from "@/lib/utils";

export interface FilterPillOption<T> {
  value: T;
  label: string;
}

interface FilterPillGroupProps<T> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function FilterPillGroup<T extends string | number | null>({
  options,
  value,
  onChange,
  className,
}: FilterPillGroupProps<T>) {
  return (
    <div className={cn("flex items-center gap-0.5 rounded-xl border border-border p-1 h-8", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 cursor-pointer",
              active ? "bg-border text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
