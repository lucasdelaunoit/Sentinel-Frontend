import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import SeveredSkillBadge from "@/components/specified/models/skill/badges/SeveredSkillBadge.tsx";
import ImpactBadge from "@/components/specified/pages/planning/badges/ImpactBadge.tsx";
import { TONE_BG } from "@/lib/scoring.ts";
import { cn } from "@/lib/utils.ts";

interface MediumProjectImpactRowProps {
  project: ProjectImpact;
  className?: string;
  onClick?: () => void;
}

function statusTone(status: ProjectImpact["status_after"]): "success" | "warning" | "danger" {
  if (status === "blocked") return "danger";
  if (status === "at_risk") return "warning";
  return "success";
}

function skillSeverity(sev: PlanningSeverity): Severity {
  if (sev === "critical" || sev === "high") return "critical";
  if (sev === "medium" || sev === "low") return "warning";
  return "ok";
}

export default function MediumProjectImpactRow({ project, className, onClick }: MediumProjectImpactRowProps) {
  const tone = statusTone(project.status_after);

  return (
    <SecondaryCard
      className={cn("items-start", className)}
      onClick={onClick}
      before={<span className={cn("mt-1.5 size-2 rounded-full shrink-0", TONE_BG[tone])} />}
      title={
        <span className="flex items-center justify-between gap-2">
          <span className="truncate">{project.name}</span>
          <ImpactBadge level={project.level} />
        </span>
      }
      description={
        <span className="mt-2 flex flex-col gap-2">
          <span className="grid grid-cols-3 gap-2">
            <MetricMini
              label="Bus factor"
              before={project.bus_factor_before}
              after={project.bus_factor_after}
              invertGood
            />
            <MetricMini
              label="Coverage"
              before={project.coverage_pct_before}
              after={project.coverage_pct_after}
              suffix="%"
            />
            <MetricMini label="Risk" before={project.risk_score_before} after={project.risk_score_after} invertGood />
          </span>

          {project.skills_at_risk.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {project.skills_at_risk.map((s) => (
                <SeveredSkillBadge key={s.skill_id} name={`${s.name} · ${s.owners_left} left`} severity={skillSeverity(s.severity)} />
              ))}
            </span>
          )}

          {project.recommendation && (
            <span className="flex items-start gap-1.5 text-[11px] italic text-muted-foreground">
              <Lightbulb className="mt-0.5 size-3 shrink-0" />
              {project.recommendation}
            </span>
          )}
        </span>
      }
    />
  );
}

MediumProjectImpactRow.Skeleton = function MediumProjectImpactRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-tertiary p-3">
      <Skeleton className="mt-1.5 size-2 rounded-full" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MetricMiniProps {
  label: string;
  before: number;
  after: number;
  suffix?: string;
  invertGood?: boolean;
}

function MetricMini({ label, before, after, suffix = "", invertGood = false }: MetricMiniProps) {
  const delta = after - before;
  const improved = invertGood ? delta < 0 : delta > 0;
  const worse = invertGood ? delta > 0 : delta < 0;

  return (
    <span className="block rounded-md bg-muted/30 px-2 py-1.5">
      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/70">{label}</span>
      <span className="flex items-center gap-1 text-[11px] font-bold">
        <span className="text-muted-foreground">
          {before}
          {suffix}
        </span>
        <span className="text-muted-foreground/40">→</span>
        <span className={cn(worse && "text-destructive-foreground", improved && "text-success")}>
          {after}
          {suffix}
        </span>
        {delta !== 0 && (
          <Badge
            variant={worse ? "destructive" : "secondary"}
            className={cn("ml-auto h-4 px-1 text-[9px] gap-0", improved && "bg-success/15 text-success")}
          >
            {delta > 0 ? <TrendingUp /> : <TrendingDown />}
            {Math.abs(delta)}
            {suffix}
          </Badge>
        )}
      </span>
    </span>
  );
}
