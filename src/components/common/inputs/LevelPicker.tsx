import { cn } from "@/lib/utils";

interface LevelPickerProps {
  value: number;
  onChange: (level: number) => void;
  levels?: number[];
  className?: string;
}

export default function LevelPicker({
  value,
  onChange,
  levels = [1, 2, 3, 4, 5],
  className,
}: LevelPickerProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {levels.map((lvl) => {
        const active = value === lvl;
        return (
          <button
            key={lvl}
            type="button"
            onClick={() => onChange(lvl)}
            className={cn(
              "size-7 rounded-md text-[12px] font-bold tabular-nums transition-colors cursor-pointer",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted",
            )}
          >
            {lvl}
          </button>
        );
      })}
    </div>
  );
}
