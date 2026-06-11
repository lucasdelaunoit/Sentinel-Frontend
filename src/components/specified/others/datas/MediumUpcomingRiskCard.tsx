import { ArrowRight } from "lucide-react";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import RiskBadge from "@/components/specified/others/badges/RiskBadge.tsx";
import { cn } from "@/lib/utils.ts";
import { formatDelta } from "@/utils/formatters/number.ts";
import type { UpcomingRiskEvent } from "@/types/others/UpcomingRiskEvent";
import { ArrowElbowDownRightIcon } from "@phosphor-icons/react";

interface MediumUpcomingRiskCardProps {
  event: UpcomingRiskEvent;
}

function formatWhen(iso: string): { date: string; relative: string } {
  const start = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - today.getTime()) / 86_400_000);
  const relative = days <= 0 ? "Today" : days === 1 ? "Tomo." : `${days}d`;
  const date = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { date, relative };
}

function deltaChipTone(delta: number, worseWhen: "up" | "down"): string {
  const worse = worseWhen === "up" ? delta > 0 : delta < 0;
  const better = worseWhen === "up" ? delta < 0 : delta > 0;
  if (worse) return "bg-danger/10 text-danger";
  if (better) return "bg-success/10 text-success";
  return "bg-muted text-muted-foreground";
}

export default function MediumUpcomingRiskCard({ event }: MediumUpcomingRiskCardProps) {
  const { date, relative } = formatWhen(event.date);
  const { affected } = event.org_impact;

  const projects = event.affected_projects;
  const topProject = projects[0];
  const extraProjects = Math.max(0, projects.length - 1);
  const lostSkills = topProject?.lost_skills ?? [];
  const visibleSkills = lostSkills.slice(0, 3);
  const extraSkills = Math.max(0, lostSkills.length - visibleSkills.length);
  const busFactorDrop =
    topProject && topProject.bus_factor_after < topProject.bus_factor_before
      ? { before: topProject.bus_factor_before, after: topProject.bus_factor_after }
      : null;

  return (
    <SecondaryCard
      before={
        <div className="flex w-14 shrink-0 flex-col items-center gap-1">
          <span className="rounded-md bg-border px-2.5 py-1 text-[13px] font-bold tabular-nums text-foreground">
            {relative}
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">{date}</span>
        </div>
      }
      title={
        <span className="flex items-center gap-2.5">
          <UserAvatar
            firstname={event.employee.firstname}
            lastname={event.employee.lastname}
            variant="away"
            size="lg"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-semibold leading-tight text-foreground">
              {event.employee.firstname} {event.employee.lastname}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-[12px] font-semibold tabular-nums text-foreground">
                  {affected.fragility.before}
                </span>
                <ArrowRight className="size-3 text-muted-foreground/60" />
                <span className="text-[12px] font-semibold tabular-nums text-foreground">
                  {affected.fragility.after}
                </span>
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    deltaChipTone(affected.fragility.delta, "up"),
                  )}
                >
                  {formatDelta(affected.fragility.delta)}
                </span>
              </span>
            </span>
          </span>
        </span>
      }
      description={
        <span className="mt-2.5 block space-y-2">
          {topProject ? (
            <span className="block space-y-1.5">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 shrink-0 rounded-full bg-danger" />
                <span className="truncate text-[12px] font-semibold text-foreground">{topProject.name}</span>
                {extraProjects > 0 && (
                  <span className="text-[10px] font-medium text-muted-foreground">+{extraProjects} more</span>
                )}
              </span>

              {(visibleSkills.length > 0 || busFactorDrop) && (
                <span className="flex">
                  <ArrowElbowDownRightIcon className="mt-0.5" />
                  <span className="flex flex-wrap items-center gap-1">
                    {visibleSkills.map((skill: string) => (
                      <span
                        key={skill}
                        className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                    {extraSkills > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground">+{extraSkills}</span>
                    )}
                    {busFactorDrop && (
                      <span className="ml-auto rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-danger">
                        Bus Factor {busFactorDrop.before} → {busFactorDrop.after}
                      </span>
                    )}
                  </span>
                </span>
              )}
            </span>
          ) : (
            <span className="block text-[10px] italic text-muted-foreground/70">No projected operational impact.</span>
          )}
        </span>
      }
      action={<RiskBadge level={event.severity} size="sm" />}
    />
  );
}
