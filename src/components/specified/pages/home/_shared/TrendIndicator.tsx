import { TrendingDown, TrendingUp, Minus } from "lucide-react";

import { cn } from "@/lib/utils.ts";
import { TREND_LABEL, type Trend } from "@/data/dashboard.ts";

interface TrendIndicatorProps {
  trend: Trend;
  /** Show the textual label next to the arrow. */
  showLabel?: boolean;
  className?: string;
}

const TREND_STYLE: Record<Trend, { icon: typeof Minus; color: string }> = {
  deteriorating: { icon: TrendingDown, color: "text-danger" },
  stable: { icon: Minus, color: "text-muted-foreground" },
  improving: { icon: TrendingUp, color: "text-success" },
};

export default function TrendIndicator({ trend, showLabel = true, className }: TrendIndicatorProps) {
  const { icon: Icon, color } = TREND_STYLE[trend];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold", color, className)}>
      <Icon className="size-3.5" />
      {showLabel && TREND_LABEL[trend]}
    </span>
  );
}
