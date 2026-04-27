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
      <div className="text-3xl font-extrabold"> {/*style={{ fontSize: "34px", fontWeight: 800, color: theme.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginTop: "2px" }}*/}
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
      {/*trend !== undefined && (
        <div style={{
          display: "flex", alignItems: "center", gap: "4px", marginTop: "6px",
          fontSize: "12.5px", color: trendDir === "up" ? theme.success : theme.danger
        }}>
          {trendDir === "up" ? Icons.trend : Icons.trendDown}
          <span style={{ fontWeight: 600 }}>{trend}</span>
          <span style={{ color: theme.textMuted, fontWeight: 400 }}>{trendLabel}</span>
        </div>
      )*/}
      {/*<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "13.5px", color: theme.textSecondary, fontWeight: 500, letterSpacing: "0.01em" }}>
          {title}
        </span>
        <span style={{ color: theme.textMuted, opacity: 0.6 }}>{icon}</span>
      </div>
      <div style={{ fontSize: "34px", fontWeight: 800, color: theme.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginTop: "2px" }}>
        {value}
      </div>
      {trend !== undefined && (
        <div style={{
          display: "flex", alignItems: "center", gap: "4px", marginTop: "6px",
          fontSize: "12.5px", color: trendDir === "up" ? theme.success : theme.danger
        }}>
          {trendDir === "up" ? Icons.trend : Icons.trendDown}
          <span style={{ fontWeight: 600 }}>{trend}</span>
          <span style={{ color: theme.textMuted, fontWeight: 400 }}>{trendLabel}</span>
        </div>
      )}*/}

      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-muted-foreground tracking-wide">
          {title}
        </p>
        <div className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground/50 group-hover:bg-muted group-hover:text-muted-foreground transition-colors">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="text-[28px] font-bold tracking-tight text-foreground leading-none">
        {value}
      </div>
      <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", color)}>
        {trendUp ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {trend}
      </div>
    </Card>
  );
}

/**/

/* <div className="group relative flex flex-col gap-3 rounded-2xl bg-card border border-border/60 p-5 shadow-sm hover:shadow-md hover:border-border transition-all duration-200">
      <div className="flex items-start justify-between">
        <p className="text-[12px] font-medium text-muted-foreground tracking-wide">
          {title}
        </p>
        <div className="flex size-8 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground/50 group-hover:bg-muted group-hover:text-muted-foreground transition-colors">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="text-[28px] font-bold tracking-tight text-foreground leading-none">
        {value}
      </div>
      <div className={cn("flex items-center gap-1.5 text-[11px] font-medium", color)}>
        {trendUp ? (
          <TrendingUp className="size-3" />
        ) : (
          <TrendingDown className="size-3" />
        )}
        {trend}
      </div>
    </div>*/