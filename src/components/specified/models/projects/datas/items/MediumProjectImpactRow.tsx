import { CalendarRange, UserMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import MetricBox from "@/components/common/data/MetricBox.tsx";
import SeveredSkillBadge from "@/components/specified/models/skill/badges/SeveredSkillBadge.tsx";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
import { getFragilityTier } from "@/lib/theme/scoring.ts";
import { TONE_BG } from "@/lib/theme/tone.ts";
import { cn } from "@/lib/utils.ts";

interface MediumProjectImpactRowProps {
  project: ProjectImpact;
  /** Scenario window driving this project's impact, e.g. "12–18 Jun". */
  window?: string | null;
  /** People away in the scenario who staff this project, e.g. "Blair Hauck +1". */
  drivers?: string | null;
  className?: string;
  onClick?: () => void;
}

/**
 * How much this absence actually degrades the project — driven by the *change*, not the
 * project's baseline state. A scenario that moves nothing reads "Safe", even on a project
 * that is fragile to begin with.
 */
function impactSeverity(p: ProjectImpact): Severity {
  const fragilityUp = p.risk_score_after - p.risk_score_before > 0;
  const busDropped = p.bus_factor_after < p.bus_factor_before;
  const coverageDropped = p.coverage_pct_after < p.coverage_pct_before;
  const worsened = fragilityUp || busDropped || coverageDropped || p.skills_at_risk.length > 0;

  if (!worsened) return "ok";

  const lostLastOwner = p.bus_factor_after === 0 && p.bus_factor_before > 0;
  const criticalSkillUncovered = p.skills_at_risk.some((s) => s.severity === "critical");
  if (lostLastOwner || criticalSkillUncovered || getFragilityTier(p.risk_score_after).tone === "danger") {
    return "critical";
  }
  return "warning";
}

export default function MediumProjectImpactRow({
  project,
  window,
  drivers,
  className,
  onClick,
}: MediumProjectImpactRowProps) {
  const fragilityTier = getFragilityTier(project.risk_score_after);

  const skills = project.skills_at_risk;
  const visibleSkills = skills.slice(0, 4);
  const extraSkills = Math.max(0, skills.length - visibleSkills.length);

  return (
    <SecondaryCard
      className={cn("items-center gap-4 p-4", className)}
      onClick={onClick}
      before={
        <div className="flex w-16 shrink-0 flex-col items-center gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Fragility</span>
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-[15px] font-bold tabular-nums text-background",
              TONE_BG[fragilityTier.tone],
            )}
          >
            {project.risk_score_after}
          </span>
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
            from {project.risk_score_before}
          </span>
        </div>
      }
      title={
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="truncate text-[15px] font-semibold leading-tight text-foreground">{project.name}</span>

          {(window || drivers) && (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-medium text-muted-foreground">
              {window && (
                <span className="flex items-center gap-1.5">
                  <CalendarRange className="size-3.5 text-muted-foreground/70" />
                  {window}
                </span>
              )}
              {drivers && (
                <span className="flex items-center gap-1.5 text-danger">
                  <UserMinus className="size-3.5" />
                  {drivers} away
                </span>
              )}
            </span>
          )}
        </span>
      }
      description={
        <span className="mt-3 block space-y-2.5">
          <span className="grid grid-cols-2 gap-2">
            <MetricBox
              label="Bus factor"
              before={project.bus_factor_before}
              after={project.bus_factor_after}
              delta={project.bus_factor_delta}
              worseWhen="down"
            />
            <MetricBox
              label="Coverage"
              before={project.coverage_pct_before}
              after={project.coverage_pct_after}
              delta={project.coverage_delta_pct}
              worseWhen="down"
              suffix="%"
            />
          </span>

          {visibleSkills.length > 0 && (
            <span className="flex flex-wrap items-center gap-1.5">
              {visibleSkills.map((s) => (
                <SeveredSkillBadge key={s.skill_id} name={`${s.name} · ${s.owners_left} left`} severity={s.severity} />
              ))}
              {extraSkills > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground">+{extraSkills} more</span>
              )}
            </span>
          )}
        </span>
      }
      action={<SeverityBadge severity={impactSeverity(project)} size="md" />}
    />
  );
}

MediumProjectImpactRow.Skeleton = function MediumProjectImpactRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-tertiary p-4">
      <div className="flex w-16 shrink-0 flex-col items-center gap-1">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-7 w-10 rounded-md" />
        <Skeleton className="h-2.5 w-10" />
      </div>
      <div className="flex-1 min-w-0 space-y-2.5">
        <Skeleton className="h-4 w-44" />
        <Skeleton className="h-3 w-52" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
};
