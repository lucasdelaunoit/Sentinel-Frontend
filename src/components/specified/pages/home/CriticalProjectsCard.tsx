import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { PROJECTS } from "@/data/projects.ts";

const RISK_LEVELS = [
  { label: "Critical", threshold: 25, badge: "bg-rose-50 text-rose-600 border-rose-200/60" },
  { label: "High",     threshold: 15, badge: "bg-orange-50 text-orange-600 border-orange-200/60" },
  { label: "Medium",   threshold: 8,  badge: "bg-amber-50 text-amber-600 border-amber-200/60" },
  { label: "Low",      threshold: 0,  badge: "bg-emerald-50 text-emerald-600 border-emerald-200/60" },
];

function getRiskLevel(score: number) {
  return (
    RISK_LEVELS.find((l, i) =>
      score >= l.threshold && (i === 0 || score < RISK_LEVELS[i - 1].threshold),
    ) ?? RISK_LEVELS[3]
  );
}

export default function CriticalProjectsCard() {
  const navigate = useNavigate();

  const atRiskCount = useMemo(
    () => PROJECTS.filter(p => p.riskScore >= 15 || p.health < 60).length,
    [],
  );

  const criticalProjects = useMemo(
    () => [...PROJECTS].sort((a, b) => b.riskScore - a.riskScore).slice(0, 2),
    [],
  );

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <CardTitle>Critical Projects</CardTitle>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {atRiskCount} at risk
        </span>
      </div>

      <CardContent className="p-0">
        <div className="space-y-2.5">
          {criticalProjects.map((p, i) => {
            const level = getRiskLevel(p.riskScore);
            return (
              <SecondaryCard
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                before={
                  <div className={cn("flex size-8 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm bg-destructive-foreground")}>
                    {p.id.slice(-2)}
                  </div>
                }
                title={p.name}
                description={
                  <span className={cn("text-[11px] font-medium")}>
                    Bus factor: {p.busFactor} · Risk: {p.riskScore}
                  </span>
                }
                action={
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn("text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border", level.badge)}>
                      {level.label}
                    </span>
                    <Eye className={cn("size-3.5")} />
                  </div>
                }
              />
            );
          })}
        </div>

        <button
          onClick={() => navigate("/projects")}
          className="mt-3 w-full py-1.5 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
        >
          View all projects
          <ArrowRight className="size-3" />
        </button>
      </CardContent>
    </Card>
  );
}
