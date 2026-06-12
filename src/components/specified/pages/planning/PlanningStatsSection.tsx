import { GaugeIcon, PulseIcon, ShieldIcon, UsersIcon } from "@phosphor-icons/react";
import StatCardsGrid from "@/components/common/cards/StatCardsGrid.tsx";

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
  const gridClass = "md:grid-cols-2 lg:grid-cols-4";

  if (isLoading) {
    return (
      <StatCardsGrid
        className={gridClass}
        isLoading
        items={[
          { title: "Fragility", icon: GaugeIcon },
          { title: "Coverage", icon: PulseIcon },
          { title: "Bus factor", icon: ShieldIcon },
          { title: "Peak overlap", icon: UsersIcon },
        ]}
      />
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
    <StatCardsGrid
      className={gridClass}
      items={[
        { title: "Fragility", icon: GaugeIcon, card: fragility },
        { title: "Coverage", icon: PulseIcon, card: coverage },
        { title: "Bus factor", icon: ShieldIcon, card: busFactor },
        { title: "Peak overlap", icon: UsersIcon, card: peak },
      ]}
    />
  );
}
