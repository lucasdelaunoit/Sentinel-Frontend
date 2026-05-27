import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import PercentDonut from "@/components/common/charts/PercentDonut.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import { TEAM_PRESENCE, TEAM_TODAY, type TeamTodayMember } from "@/data/dashboard.ts";

function nameParts(name: string): [string, string] {
  const [first, ...rest] = name.split(" ");
  return [first, rest.join(" ")];
}

function TeamTodayRow({ member, onSimulate }: { member: TeamTodayMember; onSimulate: () => void }) {
  const [firstname, lastname] = nameParts(member.name);
  return (
    <div className="group flex items-start gap-3">
      <UserAvatar firstname={firstname} lastname={lastname} variant="away" size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{member.name}</p>
          {member.impact && <RiskBadge level={member.impact} size="sm" />}
        </div>
        <p className="truncate text-[11px] text-muted-foreground">{member.role}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Away — <span className="font-medium text-foreground">{member.reason}</span>
          {member.impactedProjects > 0 && (
            <>
              {" · "}
              Impacts {member.impactedProjects} project{member.impactedProjects !== 1 ? "s" : ""}
            </>
          )}
        </p>
      </div>
      {member.impact && (
        <button
          onClick={onSimulate}
          className="invisible flex shrink-0 items-center gap-1 self-center rounded-lg px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 group-hover:visible"
        >
          <PlayCircle className="size-3.5" /> Simulate
        </button>
      )}
    </div>
  );
}

export default function TeamTodayCard() {
  const navigate = useNavigate();
  const presencePct = Math.round((TEAM_PRESENCE.present / TEAM_PRESENCE.total) * 100);

  return (
    <ComposedCard
      title="Team Today"
      action={
        <div className="ml-auto flex items-center gap-2 text-secondary-foreground">
          <span className="text-xs">
            <span className="font-semibold tabular-nums">
              {TEAM_PRESENCE.present}/{TEAM_PRESENCE.total}
            </span>{" "}
            present
          </span>
          <PercentDonut percent={presencePct} size="sm" />
        </div>
      }
      className="flex flex-col"
      footer={
        <button
          onClick={() => navigate("/?simulate=true")}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <PlayCircle className="size-3.5" /> Simulate absence impact
        </button>
      }
      footerClassName="justify-stretch"
    >
      <div className="mb-1 flex flex-col justify-center">
        {TEAM_TODAY.length === 0 ? (
          <Feedback variant="success" title="All hands on deck" description="Everyone is available today" />
        ) : (
          <div className="space-y-4 p-0.5">
            {TEAM_TODAY.map((m) => (
              <TeamTodayRow key={m.id} member={m} onSimulate={() => navigate("/?simulate=true")} />
            ))}
          </div>
        )}
      </div>
    </ComposedCard>
  );
}
