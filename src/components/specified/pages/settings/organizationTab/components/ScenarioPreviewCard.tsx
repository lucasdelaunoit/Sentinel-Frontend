import { useMemo } from "react";
import { cn } from "@/lib/utils";
import ComposedCard from "@/components/common/cards/ComposedCard";
import { ArrowRightIcon, UserCircleMinusIcon, WarningIcon } from "@phosphor-icons/react";
import type { OrgFormFields } from "../types";

type Member = { name: string; role: string; skills: Record<string, number> };
type Project = { name: string; progress: number; requiredSkills: string[] };

const SCENARIO: { team: Member[]; project: Project; leaver: string } = {
  team: [
    { name: "Alice", role: "Lead Backend", skills: { React: 4, Node: 5, TypeScript: 4 } },
    { name: "Bob", role: "Fullstack", skills: { React: 2, Postgres: 4, TypeScript: 3 } },
    { name: "Carol", role: "Frontend", skills: { React: 3, TypeScript: 3 } },
    { name: "Dan", role: "DevOps", skills: { DevOps: 4, Postgres: 2 } },
  ],
  project: { name: "Atlas", progress: 60, requiredSkills: ["React", "Node", "Postgres", "TypeScript"] },
  leaver: "Alice",
};

type Metrics = {
  busFactor: number;
  uncovered: number;
  silos: number;
  riskScore: number;
  healthScore: number;
  critical: boolean;
};

function computeMetrics(team: Member[], project: Project, form: OrgFormFields, exclude: string[] = []): Metrics {
  const active = team.filter((m) => !exclude.includes(m.name));
  const coverage = project.requiredSkills.map((skill) => {
    const count = active.filter((m) => (m.skills[skill] ?? 0) >= form.kci_min_level).length;
    return { skill, count };
  });

  const uncovered = coverage.filter((c) => c.count === 0).length;
  const silos = coverage.filter((c) => c.count > 0 && c.count <= form.silo_threshold).length;
  const covered = coverage.filter((c) => c.count > 0).map((c) => c.count);
  const busFactor = covered.length > 0 ? Math.min(...covered) : 0;
  const total = project.requiredSkills.length || 1;

  const totalW =
    form.risk_weight_bus_factor +
    form.risk_weight_uncovered_skills +
    form.risk_weight_silos +
    form.risk_weight_absence_impact;

  const busRisk =
    busFactor === 0
      ? 1
      : busFactor <= form.critical_bus_factor_threshold
        ? 1
        : Math.max(0, 1 - (busFactor - form.critical_bus_factor_threshold) / 3);
  const uncoveredRisk = uncovered / total;
  const siloRisk = silos / total;
  const absenceRisk = exclude.length > 0 ? Math.min(1, exclude.length / Math.max(1, team.length / 2)) : 0;

  const riskNormalized =
    totalW === 0
      ? 0
      : (busRisk * form.risk_weight_bus_factor +
          uncoveredRisk * form.risk_weight_uncovered_skills +
          siloRisk * form.risk_weight_silos +
          absenceRisk * form.risk_weight_absence_impact) /
        totalW;

  const riskScore = Math.round(riskNormalized * 100);
  const progressScore = project.progress;
  const healthScore = Math.round(
    ((100 - riskScore) * form.health_risk_weight + progressScore * (100 - form.health_risk_weight)) / 100,
  );

  return {
    busFactor,
    uncovered,
    silos,
    riskScore,
    healthScore,
    critical: busFactor <= form.critical_bus_factor_threshold,
  };
}

function MetricBlock({
  label,
  before,
  after,
  invertColors,
  suffix,
}: {
  label: string;
  before: number;
  after: number;
  invertColors?: boolean;
  suffix?: string;
}) {
  const delta = after - before;
  const worsened = invertColors ? delta < 0 : delta > 0;
  const improved = invertColors ? delta > 0 : delta < 0;
  const deltaColor = delta === 0 ? "text-muted-foreground" : worsened ? "text-danger" : improved ? "text-success" : "";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm text-muted-foreground tabular-nums">
          {before}
          {suffix}
        </span>
        <ArrowRightIcon className="text-muted-foreground" size={10} weight="bold" />
        <span className={cn("text-base font-semibold tabular-nums", deltaColor)}>
          {after}
          {suffix}
        </span>
        {delta !== 0 && (
          <span className={cn("text-[10px] font-medium tabular-nums", deltaColor)}>
            ({delta > 0 ? "+" : ""}
            {delta}
            {suffix})
          </span>
        )}
      </div>
    </div>
  );
}

export default function ScenarioPreviewCard({ form }: { form: OrgFormFields }) {
  const before = useMemo(() => computeMetrics(SCENARIO.team, SCENARIO.project, form), [form]);
  const after = useMemo(() => computeMetrics(SCENARIO.team, SCENARIO.project, form, [SCENARIO.leaver]), [form]);

  return (
    <ComposedCard
      className="border-dashed bg-muted/20"
      title={
        <div className="flex items-center gap-2">
          <UserCircleMinusIcon className="text-info" size={18} />
          <span>Live preview — if {SCENARIO.leaver} (Lead Backend) leaves project {SCENARIO.project.name}</span>
        </div>
      }
    >
      <p className="text-[11px] text-muted-foreground mb-3">
        Demo scenario. Tweak the settings below — watch how Sentinel's verdict on this what-if changes in real time.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 rounded-lg border border-border bg-background p-3">
        <MetricBlock label="Bus factor" before={before.busFactor} after={after.busFactor} invertColors />
        <MetricBlock label="Uncovered skills" before={before.uncovered} after={after.uncovered} />
        <MetricBlock label="Silos" before={before.silos} after={after.silos} />
        <MetricBlock label="Risk score" before={before.riskScore} after={after.riskScore} suffix="%" />
        <MetricBlock label="Health score" before={before.healthScore} after={after.healthScore} invertColors suffix="%" />
      </div>

      {after.critical && !before.critical && (
        <div className="flex items-center gap-2 mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-[11px] text-danger font-medium">
          <WarningIcon size={14} weight="fill" />
          With these settings, losing {SCENARIO.leaver} would flag {SCENARIO.project.name} as critical.
        </div>
      )}
    </ComposedCard>
  );
}
