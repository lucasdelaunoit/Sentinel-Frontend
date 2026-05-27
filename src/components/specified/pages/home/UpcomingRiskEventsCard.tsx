import { useNavigate } from "react-router-dom";
import { PlayCircle, CalendarClock } from "lucide-react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import useGetUpcomingRiskEvents from "@/hooks/useGetUpcomingRiskEvents.ts";
import type { UpcomingRiskEvent } from "@/types/dashboard";

const HORIZON_DAYS = 30;
const PREVIEW_COUNT = 4;

const KIND_LABEL: Record<UpcomingRiskEvent["kind"], string> = {
  leave: "Planned leave",
  sick_leave: "Sick leave",
};

function formatWhen(iso: string): { date: string; relative: string } {
  const start = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - today.getTime()) / 86_400_000);
  const relative = days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days}d`;
  return { date: start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), relative };
}

function formatSkills(skills: string[]): string {
  if (skills.length === 1) return skills[0];
  if (skills.length === 2) return `${skills[0]} & ${skills[1]}`;
  return `${skills[0]}, ${skills[1]} +${skills.length - 2}`;
}

/** Turns the structured project deltas into human-readable impact lines. */
function composeImpacts(event: UpcomingRiskEvent): string[] {
  const multi = event.affected_projects.length > 1;
  const lines: string[] = [];

  for (const p of event.affected_projects) {
    const prefix = multi ? `${p.name}: ` : "";
    if (p.lost_skills.length > 0) {
      lines.push(`${p.name} loses ${formatSkills(p.lost_skills)} expertise`);
    }
    if (p.coverage_after < p.coverage_before) {
      lines.push(`${prefix}coverage drops to ${p.coverage_after}%`);
    }
    if (p.bus_factor_after < p.bus_factor_before) {
      lines.push(`${prefix}bus factor becomes ${p.bus_factor_after}`);
    }
  }
  return lines;
}

function RiskEventItem({ event, onSimulate }: { event: UpcomingRiskEvent; onSimulate: () => void }) {
  const { date, relative } = formatWhen(event.date);
  const impacts = composeImpacts(event);

  return (
    <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/10 p-3.5">
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/40 py-2 text-center">
        <span className="text-[13px] font-bold leading-tight text-foreground">{date}</span>
        <span className="text-[10px] font-medium text-muted-foreground">{relative}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar firstname={event.employee.firstname} lastname={event.employee.lastname} variant="away" size="base" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {event.employee.firstname} {event.employee.lastname}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">{KIND_LABEL[event.kind]}</p>
            </div>
          </div>
          <RiskBadge level={event.severity} size="sm" />
        </div>

        {impacts.length > 0 ? (
          <ul className="mb-2 space-y-1">
            {impacts.map((impact) => (
              <li key={impact} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-danger" />
                {impact}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-2 text-[11px] italic text-muted-foreground/70">
            No projected project impact within the active coverage horizon.
          </p>
        )}

        <button
          onClick={onSimulate}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10"
        >
          <PlayCircle className="size-3.5" /> Simulate impact
        </button>
      </div>
    </div>
  );
}

export default function UpcomingRiskEventsCard() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetUpcomingRiskEvents(HORIZON_DAYS);

  if (isLoading) return <UpcomingRiskEventsCard.Skeleton />;

  const events = data?.events ?? [];

  return (
    <ComposedCard
      title={
        <span className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" /> Upcoming Risk Events
        </span>
      }
      action={<span className="ml-auto text-xs text-secondary-foreground">next {HORIZON_DAYS} days</span>}
    >
      {isError ? (
        <Feedback variant="danger" title="Failed to load risk events" description="Check API connection." />
      ) : events.length === 0 ? (
        <Feedback variant="success" title="No upcoming disruptions" description="No absences projected in the horizon." />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {events.map((e) => (
            <RiskEventItem key={e.id} event={e} onSimulate={() => navigate("/?simulate=true")} />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

UpcomingRiskEventsCard.Skeleton = function UpcomingRiskEventsCardSkeleton() {
  return (
    <ComposedCard
      title={
        <span className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" /> Upcoming Risk Events
        </span>
      }
      action={<Skeleton className="ml-auto h-3.5 w-24" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-border/50 bg-muted/10 p-3.5">
            <Skeleton className="size-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </ComposedCard>
  );
};
