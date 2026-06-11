import { cn } from "@/lib/utils.ts";
import { SEVERITY_BADGE } from "@/lib/theme/severity.ts";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { WarningIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import AlertCategoryBadge from "@/components/specified/models/alert/badges/AlertCategoryBadge.tsx";

export default function MediumAlertRow({ alert }: { alert: ProjectFragilityAlert }) {
  return (
    <SecondaryCard
      before={
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg text-[13px] shrink-0",
            SEVERITY_BADGE[alert.severity],
          )}
        >
          <WarningIcon className="size-4" weight="bold" />
        </div>
      }
      title={
        <div className="text-foreground leading-relaxed flex flex-wrap items-center gap-x-2">
          {alert.title}
          <AlertCategoryBadge category={alert.category} severity={alert.severity} />
        </div>
      }
      description={<p className="text-xs text-muted-foreground mt-1 italic">{alert.detail}</p>}
    />
  );
}

MediumAlertRow.Skeleton = function MediumAlertRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-tertiary p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <WarningIcon className="size-4 text-muted-foreground" weight="bold" />
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
};
