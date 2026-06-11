import { CalendarDotsIcon, FolderIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import MetricBox from "@/components/common/data/MetricBox.tsx";
import OrgCriticalBadge from "@/components/specified/models/skill/badges/OrgCriticalBadge.tsx";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
import { SEVERITY_BG } from "@/lib/theme/severity.ts";
import { formatDateRuns } from "@/utils/planning/calendar.ts";
import { cn } from "@/lib/utils.ts";

interface MediumSkillImpactRowProps {
  skill: SkillImpact;
  className?: string;
  onClick?: () => void;
}

export default function MediumSkillImpactRow({ skill, className, onClick }: MediumSkillImpactRowProps) {
  const projectCount = skill.projects_impacted.length;
  const uncovered = formatDateRuns(skill.dates_uncovered);

  return (
    <SecondaryCard
      className={cn("items-start gap-4 p-4", className)}
      onClick={onClick}
      title={
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("size-2 shrink-0 rounded-full", SEVERITY_BG[skill.severity])} />
          <span className="truncate text-[14px] font-semibold leading-tight text-foreground">{skill.name}</span>
          {skill.is_critical_for_org && <OrgCriticalBadge className="shrink-0" />}
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

          {(projectCount > 0 || uncovered) && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-muted-foreground">
              {projectCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <FolderIcon className="size-3.5 text-muted-foreground/70" />
                  {projectCount} project{projectCount === 1 ? "" : "s"} affected
                </span>
              )}
              {uncovered && (
                <span className="flex min-w-0 items-center gap-1.5 text-danger">
                  <CalendarDotsIcon className="size-3.5 shrink-0" />
                  <span className="truncate">Uncovered {uncovered}</span>
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
