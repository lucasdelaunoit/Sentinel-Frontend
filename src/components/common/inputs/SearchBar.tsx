import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Input } from "@/components/ui/input.tsx";

type SearchBarSize = "sm" | "md";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: SearchBarSize;
}

const SIZE_STYLES: Record<
  SearchBarSize,
  { input: string; icon: string; clear: string; iconLeft: string; clearRight: string }
> = {
  sm: {
    input: "pl-7 pr-6 h-8 py-1 w-44 text-[12px] rounded-md",
    icon: "size-3.5",
    clear: "size-3",
    iconLeft: "left-2",
    clearRight: "right-2",
  },
  md: {
    input: "pl-9 pr-8 h-8 py-4.5 w-56",
    icon: "size-3.5",
    clear: "size-3.5",
    iconLeft: "left-2.5",
    clearRight: "right-2.5",
  },
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  size = "md",
}: SearchBarProps) {
  const s = SIZE_STYLES[size];
  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none z-10",
          s.iconLeft,
          s.icon,
        )}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(s.input, "focus-visible:outline-none focus:outline-none")}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors focus-visible:outline-none",
            s.clearRight,
          )}
        >
          <X className={s.clear} />
        </button>
      )}
    </div>
  );
}
