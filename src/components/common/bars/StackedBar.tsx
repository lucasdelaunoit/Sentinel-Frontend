import { cn } from "@/lib/utils";

export interface StackedBarPart {
  color: string;
  value: number;
  label?: string;
}

interface StackedBarProps {
  parts: StackedBarPart[];
  emptyMessage?: string;
  className?: string;
}

export default function StackedBar({ parts, emptyMessage = "No values set", className }: StackedBarProps) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total === 0) {
    return (
      <div
        className={cn(
          "h-3 w-full rounded-full bg-muted/40 flex items-center justify-center",
          className,
        )}
      >
        <span className="text-[10px] text-muted-foreground">{emptyMessage}</span>
      </div>
    );
  }
  return (
    <div className={cn("h-3 w-full rounded-full overflow-hidden flex bg-muted/40", className)}>
      {parts.map((p, i) => {
        const w = (p.value / total) * 100;
        if (w === 0) return null;
        return (
          <div
            key={i}
            className={cn("h-full transition-[width] duration-300", p.color)}
            style={{ width: `${w}%` }}
            title={p.label ? `${p.label}: ${Math.round(w)}%` : undefined}
          />
        );
      })}
    </div>
  );
}
