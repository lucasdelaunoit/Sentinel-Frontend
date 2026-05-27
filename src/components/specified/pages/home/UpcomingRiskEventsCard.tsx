import { useNavigate } from "react-router-dom";
import { PlayCircle, CalendarClock } from "lucide-react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import {
  RISK_EVENT_KIND_LABEL,
  UPCOMING_RISK_EVENTS,
  type RiskEvent,
} from "@/data/dashboard.ts";

/** Dashboard "today" — kept in sync with the mock event dates. */
const TODAY = new Date("2026-05-27");

function nameParts(name: string): [string, string] {
  const [first, ...rest] = name.split(" ");
  return [first, rest.join(" ")];
}

function formatWhen(iso: string): { date: string; relative: string } {
  const d = new Date(iso);
  const days = Math.round((d.getTime() - TODAY.getTime()) / 86_400_000);
  const relative = days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days}d`;
  return { date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), relative };
}

function RiskEventItem({ event, onSimulate }: { event: RiskEvent; onSimulate: () => void }) {
  const [firstname, lastname] = nameParts(event.employee);
  const { date, relative } = formatWhen(event.date);

  return (
    <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/10 p-3.5">
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/40 py-2 text-center">
        <span className="text-[13px] font-bold leading-tight text-foreground">{date}</span>
        <span className="text-[10px] font-medium text-muted-foreground">{relative}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar firstname={firstname} lastname={lastname} variant="away" size="base" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{event.employee}</p>
              <p className="truncate text-[10px] text-muted-foreground">{RISK_EVENT_KIND_LABEL[event.kind]}</p>
            </div>
          </div>
          <RiskBadge level={event.severity} size="sm" />
        </div>

        <ul className="mb-2 space-y-1">
          {event.impacts.map((impact) => (
            <li key={impact} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-danger" />
              {impact}
            </li>
          ))}
        </ul>

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

  return (
    <ComposedCard
      title={
        <span className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" /> Upcoming Risk Events
        </span>
      }
      action={<span className="ml-auto text-xs text-secondary-foreground">predicted disruptions</span>}
    >
      <div className="grid grid-cols-2 gap-3">
        {UPCOMING_RISK_EVENTS.map((e) => (
          <RiskEventItem key={e.id} event={e} onSimulate={() => navigate("/?simulate=true")} />
        ))}
      </div>
    </ComposedCard>
  );
}
