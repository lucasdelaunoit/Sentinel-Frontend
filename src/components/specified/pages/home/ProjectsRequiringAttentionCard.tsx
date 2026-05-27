import { useNavigate } from "react-router-dom";
import { PlayCircle, ArrowUpRight, Lightbulb, UserRound } from "lucide-react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import TrendIndicator from "@/components/specified/pages/home/_shared/TrendIndicator.tsx";
import { PROJECTS_REQUIRING_ATTENTION, type AttentionProject } from "@/data/dashboard.ts";

function AttentionProjectCard({
  project,
  onOpen,
  onSimulate,
}: {
  project: AttentionProject;
  onOpen: () => void;
  onSimulate: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{project.name}</p>
        <RiskBadge level={project.riskLevel} score={project.riskScore} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Why it needs attention */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Main issues
          </p>
          <ul className="space-y-1">
            {project.issues.map((issue) => (
              <li key={issue} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <span className="mt-1.5 size-1 shrink-0 rounded-full bg-danger" />
                {issue}
              </li>
            ))}
          </ul>
        </div>

        {/* Status + remediation */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Coverage <span className="font-semibold text-foreground">{project.coverage}%</span>
            </span>
            <TrendIndicator trend={project.trend} />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <UserRound className="size-3.5 shrink-0 text-muted-foreground/70" />
            Critical: <span className="font-semibold text-foreground">{project.criticalEmployee}</span>
          </div>
          <div className="flex items-start gap-1.5 rounded-lg border border-primary/20 bg-primary/5 p-2 text-[11px] text-foreground">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
            {project.suggestedAction}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-border/40 pt-3">
        <button
          onClick={onOpen}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowUpRight className="size-3.5" /> Open analysis
        </button>
        <button
          onClick={onSimulate}
          className="flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <PlayCircle className="size-3.5" /> Simulate absence
        </button>
      </div>
    </div>
  );
}

export default function ProjectsRequiringAttentionCard() {
  const navigate = useNavigate();

  return (
    <ComposedCard
      title="Projects Requiring Attention"
      action={
        <span className="ml-auto text-xs text-secondary-foreground">
          <span className="font-semibold tabular-nums">{PROJECTS_REQUIRING_ATTENTION.length}</span> need action
        </span>
      }
    >
      <div className="space-y-3">
        {PROJECTS_REQUIRING_ATTENTION.map((p) => (
          <AttentionProjectCard
            key={p.id}
            project={p}
            onOpen={() => navigate(`/projects/${p.id}`)}
            onSimulate={() => navigate("/?simulate=true")}
          />
        ))}
      </div>
    </ComposedCard>
  );
}
