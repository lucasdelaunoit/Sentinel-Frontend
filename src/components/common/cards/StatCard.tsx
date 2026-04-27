import { cn } from "@/lib/utils.ts";
import type {ElementType, ReactNode} from "react";
import {Card} from "@/components/ui/card.tsx";
import { ArrowRightIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: ReactNode;
  trend: ReactNode;
  trendUp?: boolean;
  trendColor?: string;
  icon: ElementType;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  trend,
  trendUp = true,
  trendColor,
  icon: Icon,
  onClick,
}: StatCardProps) {
  const color = trendColor ?? (trendUp ? "text-emerald-600" : "text-rose-500");

  return (
    <Card
      className={cn("px-5 py-6", onClick && "cursor-pointer hover:bg-muted/30 transition-colors")}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">
          {title}
        </span>
        <span className="text-muted-foreground opacity-60"><Icon className="h-4"/></span>
      </div>
      <div className="text-4xl font-semibold"> {/*style={{ fontSize: "34px", fontWeight: 800, color: theme.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginTop: "2px" }}*/}
        {value}
      </div>
      {trend !== undefined && (
        <div className="text-sm flex items-center gap-1">
          <ArrowRightIcon size={13} /> <span className="font-semibold">{trend}</span>
        </div>
      )}
    </Card>
  );
}