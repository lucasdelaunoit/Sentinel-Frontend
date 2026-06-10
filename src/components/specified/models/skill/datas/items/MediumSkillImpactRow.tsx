import { CalendarRange, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import MetricBox from "@/components/common/data/MetricBox.tsx";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
import { SEVERITY_COLORS } from "@/lib/severity.ts";
import { cn } from "@/lib/utils.ts";

interface MediumSkillImpactRowProps {
  skill: SkillImpact;
  className?: string;
  onClick?: () => void;
}

export default function MediumSkillImpactRow({ skill, className, onClick }: MediumSkillImpactRowProps) {
  const projectCount = skill.projects_impacted.length;
  const extraDates = Math.max(0, skill.dates_uncovered.length - 4);

  return (
    <SecondaryCard
      className={cn("items-start gap-4 p-4", className)}
      onClick={onClick}
      title={
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn("size-2 shrink-0 rounded-full", `bg-${SEVERITY_COLORS[skill.severity].backgroundColor}`)}
          />
          <span className="truncate text-[14px] font-semibold leading-tight text-foreground">{skill.name}</span>
          {skill.is_critical_for_org && (
            <Badge
              variant="outline"
              className="h-4 shrink-0 gap-1 border-danger/40 px-1.5 text-[9px] font-semibold text-danger"
            >
              <ShieldAlert className="size-2.5" />
              Org-critical
            </Badge>
          )}
        </span>
      }
      description={
        <span className="mt-3 block space-y-2.5">
          <span className="grid grid-cols-2 gap-4">
            <MetricBox
              label="Coverage"
              before={skill.coverage_pct_before}
              after={skill.coverage_pct_after}
              suffix="%"
            />
            <MetricBox label="Owners" before={skill.owners_total} after={skill.owners_left} />
          </span>

          {(projectCount > 0 || skill.dates_uncovered.length > 0) && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-muted-foreground">
              {projectCount > 0 && (
                <span>
                  {projectCount} project{projectCount === 1 ? "" : "s"} affected
                </span>
              )}
              {skill.dates_uncovered.length > 0 && (
                <span className="flex min-w-0 items-center gap-1.5 text-danger">
                  <CalendarRange className="size-3.5 shrink-0" />
                  <span className="truncate">
                    Uncovered {skill.dates_uncovered.slice(0, 4).join(", ")}
                    {extraDates > 0 ? ` +${extraDates}` : ""}
                  </span>
                </span>
              )}
            </span>
          )}
        </span>
      }
      action={<SeverityBadge severity={skill.severity} size="md" />}
    />
  );
}

MediumSkillImpactRow.Skeleton = function MediumSkillImpactRowSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-xl bg-tertiary p-4">
      <div className="min-w-0 flex-1 space-y-2.5">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-2 gap-2">
          <MetricBox.Skeleton />
          <MetricBox.Skeleton />
        </div>
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
};
