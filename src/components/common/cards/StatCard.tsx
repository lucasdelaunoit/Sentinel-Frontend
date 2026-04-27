import { cn } from "@/lib/utils.ts";
import type {ElementType, ReactNode} from "react";
import {TrendingDown, TrendingUp} from "lucide-react";
import {Card} from "@/components/ui/card.tsx";

interface StatCardProps {
  title: string;
  value: ReactNode;
  trend: ReactNode;
  trendUp?: boolean;
  trendColor?: string;
  icon: ElementType;
}

export default function StatCard({
  title,
  value,
  trend,
  trendUp = true,
  trendColor,
  icon: Icon,
}: StatCardProps) {
  const color = trendColor ?? (trendUp ? "text-emerald-600" : "text-rose-500");

  return (
    <Card className="px-5 py-6">
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">
          {title}
        </span>
        <span className="text-muted-foreground opacity-60"><Icon className="h-4"/></span>
      </div>
      <div className="text-3xl font-bold"> {/*style={{ fontSize: "34px", fontWeight: 800, color: theme.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginTop: "2px" }}*/}
        {value}
      </div>
      {trend !== undefined && (
        <div style={{
          display: "flex", alignItems: "center", gap: "4px", marginTop: "6px",
          fontSize: "12.5px",
        }}>
          {trendUp ? (
            <TrendingUp className="size-3" />
          ) : (
            <TrendingDown className="size-3" />
          )}
          <span style={{ fontWeight: 600 }}>{trend}</span>
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
}