import { Activity, Gauge, Shield, Users } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import type { StatCardData } from "@/types/dashboard";

interface PlanningStatsSectionProps {
  data: SimulateResponse;
  isLoading?: boolean;
}

type StatSeverity = StatCardData["severity"];

function deltaInsight(before: number, after: number, suffix = ""): string {
  const delta = after - before;
  const sign = delta > 0 ? "+" : "";
  return `${before}${suffix} → ${after}${suffix} (${sign}${delta}${suffix})`;
}

function card(value: string, severity: StatSeverity, insight: string | null): StatCardData {
  return { value, severity, change: "", hint: null, raw: null, insight };
}

export default function PlanningStatsSection({ data, isLoading = false }: PlanningStatsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard.Skeleton title="Fragility" icon={Gauge} />
        <StatCard.Skeleton title="Coverage" icon={Activity} />
        <StatCard.Skeleton title="Bus factor" icon={Shield} />
        <StatCard.Skeleton title="Peak overlap" icon={Users} />
      </div>
    );
  }

  const cmp = data.comparison_vs_baseline;
  const { totals } = data;

  const fragility = card(
    String(cmp.risk_score.after),
    totals.severity,
    deltaInsight(cmp.risk_score.before, cmp.risk_score.after),
  );

  const covAfter = cmp.coverage_pct.after;
  const coverage = card(
    `${covAfter}%`,
    covAfter >= 85 ? "ok" : covAfter >= 70 ? "warning" : "critical",
    deltaInsight(cmp.coverage_pct.before, cmp.coverage_pct.after, "%"),
  );

  const bfAfter = cmp.bus_factor.after;
  const busFactor = card(
    String(bfAfter),
    bfAfter <= 1 ? "critical" : bfAfter <= 2 ? "warning" : "ok",
    deltaInsight(cmp.bus_factor.before, cmp.bus_factor.after),
  );

  const peak = card(
    String(totals.absent_headcount_peak),
    totals.absent_headcount_peak >= 4 ? "warning" : "ok",
    totals.absent_headcount_peak_date ? `peak on ${totals.absent_headcount_peak_date}` : null,
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Fragility" icon={Gauge} card={fragility} />
      <StatCard title="Coverage" icon={Activity} card={coverage} />
      <StatCard title="Bus factor" icon={Shield} card={busFactor} />
      <StatCard title="Peak overlap" icon={Users} card={peak} />
    </div>
  );
}
