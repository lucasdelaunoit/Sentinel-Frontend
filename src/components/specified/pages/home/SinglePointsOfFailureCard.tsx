import { useNavigate } from "react-router-dom";
import { PlayCircle, FolderKanban, KeyRound, UserX } from "lucide-react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import { SINGLE_POINTS_OF_FAILURE, type SpofEmployee } from "@/data/dashboard.ts";
import { cn } from "@/lib/utils.ts";

function nameParts(name: string): [string, string] {
  const [first, ...rest] = name.split(" ");
  return [first, rest.join(" ")];
}

function SpofItem({ employee, onSimulate }: { employee: SpofEmployee; onSimulate: () => void }) {
  const [firstname, lastname] = nameParts(employee.name);
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 p-3.5">
      <div className="mb-3 flex items-start gap-3">
        <UserAvatar firstname={firstname} lastname={lastname} variant="away" size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{employee.name}</p>
            <RiskBadge level={employee.risk} size="sm" />
          </div>
          <p className="truncate text-[11px] text-muted-foreground">{employee.role}</p>
        </div>
      </div>

      <ul className="mb-3 space-y-1.5 text-[11px] text-muted-foreground">
        <li className="flex items-center gap-2">
          <FolderKanban className="size-3.5 shrink-0 text-muted-foreground/70" />
          {employee.impactedProjects} impacted project{employee.impactedProjects !== 1 ? "s" : ""}
        </li>
        <li className="flex items-center gap-2">
          <KeyRound className="size-3.5 shrink-0 text-muted-foreground/70" />
          {employee.uniqueCriticalSkills} unique critical skill{employee.uniqueCriticalSkills !== 1 ? "s" : ""}
        </li>
        <li className="flex items-center gap-2">
          <UserX className="size-3.5 shrink-0 text-muted-foreground/70" />
          {employee.replacement}
        </li>
      </ul>

      <div className="mb-3 flex flex-wrap gap-1">
        {employee.criticalSkills.map((s) => (
          <span
            key={s}
            className="rounded-full border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2.5">
        <span className="text-[10px] text-muted-foreground">
          Coverage fallback:{" "}
          <span
            className={cn(
              "font-bold uppercase",
              employee.coverageFallback ? "text-warning" : "text-danger",
            )}
          >
            {employee.coverageFallback ?? "None"}
          </span>
        </span>
        <button
          onClick={onSimulate}
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10"
        >
          <PlayCircle className="size-3.5" /> Simulate
        </button>
      </div>
    </div>
  );
}

export default function SinglePointsOfFailureCard() {
  const navigate = useNavigate();

  return (
    <ComposedCard
      title="Single Points of Failure"
      action={
        <span className="ml-auto text-xs text-secondary-foreground">
          <span className="font-semibold tabular-nums">{SINGLE_POINTS_OF_FAILURE.length}</span> critical staff
        </span>
      }
      className="flex flex-col"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="mb-4 grid grid-cols-2 gap-3">
          {SINGLE_POINTS_OF_FAILURE.map((e) => (
            <SpofItem key={e.id} employee={e} onSimulate={() => navigate("/?simulate=true")} />
          ))}
        </div>
        <SecondaryButton onClick={() => navigate("/users")}>View all staff →</SecondaryButton>
      </div>
    </ComposedCard>
  );
}
