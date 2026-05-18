import { cn } from "@/lib/utils.ts";
import type { ElementType, ReactNode } from "react";
import { Input } from "@/components/ui/input.tsx";

interface RuleSentenceRowProps {
  icon?: ElementType;
  children: ReactNode;
  example: string;
}

export default function RuleSentenceRow({ icon: Icon, children, example }: RuleSentenceRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-lg text-[13px] shrink-0 bg-tertiary text-tertiary-foreground",
        )}
      >
        {Icon && <Icon className="size-4" weight="bold" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-foreground leading-relaxed flex flex-wrap items-center gap-x-1 gap-y-1.5">
          {children}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 italic">{example}</p>
      </div>
    </div>
  );
}

export function InlineNumberInput({
  value,
  onChange,
  min,
  max,
  width = "w-14",
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  width?: string;
}) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("inline-flex h-7 px-2 text-center text-[13px] font-semibold tabular-nums align-baseline", width)}
    />
  );
}
