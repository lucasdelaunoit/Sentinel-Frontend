import { Activity, Gauge, Shield, Users } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import type { StatCardData } from "@/types/dashboard";

interface PlanningStatStripProps {
  data: SimulateResponse;
}

type StatSeverity = StatCardData["severity"];

/** Map the planning 5-tier severity onto the shared 3-tier StatCard severity. */
function mapSeverity(sev: PlanningSeverity): StatSeverity {
  if (sev === "critical") return "critical";
  if (sev === "medium" || sev === "high") return "warning";
  return "ok";
}

function deltaInsight(before: number, after: number, suffix = ""): string {
  const delta = after - before;
  const sign = delta > 0 ? "+" : "";
  return `${before}${suffix} → ${after}${suffix} (${sign}${delta}${suffix})`;
}

function card(value: string, severity: StatSeverity, insight: string | null): StatCardData {
  return { value, severity, change: "", hint: null, raw: null, insight };
}

export default function PlanningStatStrip({ data }: PlanningStatStripProps) {
  const cmp = data.comparison_vs_baseline;
  const { totals } = data;

  const fragility = card(
    String(cmp.risk_score.after),
    mapSeverity(totals.severity),
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
