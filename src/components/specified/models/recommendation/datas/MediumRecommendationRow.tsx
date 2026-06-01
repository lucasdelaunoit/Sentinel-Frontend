import { cn } from "@/lib/utils.ts";
import type { Icon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import RecommendationPriorityBadge from "@/components/specified/models/recommendation/badges/RecommendationPriorityBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";

interface RuleSentenceRowProps {
  icon?: Icon;
  title: ReactNode | string;
  recommendation: ReactNode | string;
  severity?: Severity;
  priority?: "high" | "medium" | "low";
}

const SEVERITY_STYLE: Record<Severity, string> = {
  critical: "bg-danger text-background",
  warning: "bg-warning/10 text-warning",
  ok: "bg-success/10 text-success",
};

export default function MediumRecommendationRow({
  icon: Icon,
  title,
  recommendation,
  severity,
  priority,
}: RuleSentenceRowProps) {
  return (
    <SecondaryCard
      before={
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg text-[13px] shrink-0",
            severity ? SEVERITY_STYLE[severity] : "bg-tertiary text-tertiary-foreground",
          )}
        >
          {Icon && <Icon className="size-4" weight="bold" />}
        </div>
      }
      title={
        <div className="text-foreground leading-relaxed flex flex-wrap items-center gap-x-2">
          {title}
          {priority && <RecommendationPriorityBadge priority={priority} />}
        </div>
      }
      description={<p className="text-xs text-muted-foreground mt-1 italic">{recommendation}</p>}
    />
  );
}

MediumRecommendationRow.Skeleton = function MediumRecommendationRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3">
      <Skeleton className="size-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
};
