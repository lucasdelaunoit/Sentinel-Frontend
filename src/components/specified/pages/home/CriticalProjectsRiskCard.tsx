import { useNavigate } from "react-router-dom";
import { PlayCircle } from "lucide-react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import TrendIndicator from "@/components/specified/pages/home/_shared/TrendIndicator.tsx";
import { CRITICAL_PROJECTS, type CriticalProject } from "@/data/dashboard.ts";

function CriticalProjectItem({ project, onSimulate }: { project: CriticalProject; onSimulate: () => void }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{project.name}</p>
        <RiskBadge level={project.riskLevel} score={project.riskScore} size="sm" />
      </div>

      <ul className="mb-2.5 space-y-1">
        {project.issues.map((issue) => (
          <li key={issue} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-danger" />
            {issue}
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
        <div className="min-w-0 text-[10px] text-muted-foreground">
          <span className="font-semibold text-foreground">{project.criticalDependency}</span>
          <span className="mx-1.5 opacity-40">·</span>
          {project.coverage}% coverage
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TrendIndicator trend={project.trend} showLabel={false} />
          <button
            onClick={onSimulate}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10"
          >
            <PlayCircle className="size-3.5" /> Simulate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CriticalProjectsRiskCard() {
  const navigate = useNavigate();

  return (
    <ComposedCard
      title="Critical Projects"
      action={
        <span className="ml-auto text-xs text-secondary-foreground">
          <span className="font-semibold tabular-nums">{CRITICAL_PROJECTS.length}</span> need attention
        </span>
      }
      className="flex flex-col"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="mb-4 space-y-3">
          {CRITICAL_PROJECTS.map((p) => (
            <CriticalProjectItem
              key={p.id}
              project={p}
              onSimulate={() => navigate("/?simulate=true")}
            />
          ))}
        </div>
        <SecondaryButton onClick={() => navigate("/projects")}>View all projects →</SecondaryButton>
      </div>
    </ComposedCard>
  );
}
