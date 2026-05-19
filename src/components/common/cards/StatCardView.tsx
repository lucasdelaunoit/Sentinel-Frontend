import { type ElementType } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import StatCard from "@/components/common/cards/StatCard.tsx";
import type { StatCardData } from "@/types/dashboard";

const SEVERITY_VALUE: Record<Severity, string> = {
  critical: "text-destructive-foreground",
  warning: "text-amber-500",
  ok: "text-emerald-600",
};

const SEVERITY_CHANGE: Record<Severity, string> = {
  critical: "text-destructive-foreground",
  warning: "text-amber-500",
  ok: "text-emerald-600",
};

interface StatCardViewProps {
  title: string;
  icon: ElementType;
  card?: StatCardData;
  isLoading?: boolean;
  onClick?: () => void;
}

export default function StatCardView({ title, icon, card, isLoading, onClick }: StatCardViewProps) {
  if (isLoading || !card) {
    return <StatCard title={title} icon={icon} value={null} comment={null} isLoading={true} />;
  }

  return (
    <StatCard
      title={title}
      icon={icon}
      isLoading={false}
      onClick={onClick}
      value={<span className={SEVERITY_VALUE[card.severity]}>{card.value}</span>}
      comment={
        <div className="flex flex-col gap-0.5">
          <div className={cn("flex items-center gap-1 text-sm font-semibold", SEVERITY_CHANGE[card.severity])}>
            <ArrowRightIcon size={13} />
            <span>{card.change}</span>
          </div>
          {card.hint && <span className="text-[11px] text-muted-foreground">{card.hint}</span>}
        </div>
      }
    />
  );
}

StatCardView.Skeleton = function StatCardViewSkeleton({ title, icon }: Pick<StatCardViewProps, "title" | "icon">) {
  return <StatCard title={title ?? ""} icon={icon} value={null} comment={null} isLoading={true} />;
};
