import { ArrowRight } from "lucide-react";

import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import { cn } from "@/lib/utils.ts";
import type { RiskEventMetricBlock } from "@/types/dashboard";
import type { UpcomingRiskEvent } from "@/types/others/UpcomingRiskEvent";

interface MediumUpcomingRiskCardProps {
  event: UpcomingRiskEvent;
}

const KIND_LABEL: Record<UpcomingRiskEvent["kind"], string> = {
  leave: "Planned leave",
};

function formatWhen(iso: string): { date: string; relative: string } {
  const start = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - today.getTime()) / 86_400_000);
  const relative = days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`;
  const date = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { date, relative };
}

const fmtDelta = (delta: number) => (delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "±0");

function deltaChipTone(delta: number, worseWhen: "up" | "down"): string {
  const worse = worseWhen === "up" ? delta > 0 : delta < 0;
  const better = worseWhen === "up" ? delta < 0 : delta > 0;
  if (worse) return "bg-danger/10 text-danger";
  if (better) return "bg-success/10 text-success";
  return "bg-muted text-muted-foreground";
}

function MiniMetric({
  label,
  block,
  worseWhen,
}: {
  label: string;
  block: RiskEventMetricBlock;
  worseWhen: "up" | "down";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-semibold tabular-nums text-foreground">{block.before}</span>
        <ArrowRight className="size-2.5 text-muted-foreground/60" />
        <span className="text-[11px] font-semibold tabular-nums text-foreground">{block.after}</span>
        <span
          className={cn("rounded px-1 py-0.5 text-[9px] font-bold tabular-nums", deltaChipTone(block.delta, worseWhen))}
        >
          {fmtDelta(block.delta)}
        </span>
      </div>
    </div>
  );
}

export default function MediumUpcomingRiskCard({ event }: MediumUpcomingRiskCardProps) {
  const { date, relative } = formatWhen(event.date);
  const { affected } = event.org_impact;
  const hasCoverageDelta = affected.knowledge_coverage.delta !== 0;

  const projects = event.affected_projects;
  const topProject = projects[0];
  const extraProjects = Math.max(0, projects.length - 1);
  const lostSkills = topProject?.lost_skills ?? [];
  const busFactorDrop =
    topProject && topProject.bus_factor_after < topProject.bus_factor_before
      ? { before: topProject.bus_factor_before, after: topProject.bus_factor_after }
      : null;

  return (
    <SecondaryCard
      before={
        <div className="flex w-16 flex-col items-center justify-center gap-1">
          <span className="rounded-md px-3 py-1.5 text-sm font-bold tabular-nums bg-border">{relative}</span>
          <span className="text-[10px] font-medium text-muted-foreground">{date}</span>
        </div>
      }
      title={
        <span className="flex items-center gap-2">
          <UserAvatar
            firstname={event.employee.firstname}
            lastname={event.employee.lastname}
            variant="away"
            size="base"
          />
          <span className="truncate font-semibold text-foreground">
            {event.employee.firstname} {event.employee.lastname}
          </span>
          <RiskBadge level={event.severity} size="sm" />
        </span>
      }
      description={
        <span className="mt-1 block space-y-1.5">
          <span className="block text-[10px] text-muted-foreground">{KIND_LABEL[event.kind]}</span>

          <span className="block space-y-1 rounded-md bg-muted/30 p-1.5">
            <MiniMetric label="Fragility" block={affected.fragility} worseWhen="up" />
            {hasCoverageDelta && <MiniMetric label="Coverage" block={affected.knowledge_coverage} worseWhen="down" />}
          </span>

          {topProject ? (
            <span className="block space-y-0.5">
              <span className="block truncate text-[11px] font-medium text-foreground">
                {topProject.name}
                {extraProjects > 0 && <span className="ml-1 text-muted-foreground">+{extraProjects} more</span>}
              </span>
              {lostSkills.length > 0 && (
                <span className="block truncate text-[10px] text-muted-foreground">
                  Loses {lostSkills.slice(0, 2).join(", ")}
                  {lostSkills.length > 2 ? ` +${lostSkills.length - 2}` : ""}
                </span>
              )}
              {busFactorDrop && (
                <span className="block text-[10px] font-semibold text-danger tabular-nums">
                  Bus factor {busFactorDrop.before} → {busFactorDrop.after}
                </span>
              )}
            </span>
          ) : (
            <span className="block text-[10px] italic text-muted-foreground/70">No projected operational impact.</span>
          )}
        </span>
      }
    />
  );
}
