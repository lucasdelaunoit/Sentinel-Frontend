import type { OrgFormFields } from "@/components/specified/pages/settings/organizationTab/types.ts";
import { type ReactNode, useMemo } from "react";
import { ArrowRightIcon, WarningIcon } from "@phosphor-icons/react";
import MetricRow from "@/components/specified/pages/settings/organizationTab/scenarioCard/MetricRow.tsx";
import { cn } from "@/lib/utils.ts";
import { computeScenarioMetrics, TOLERANCE_CEILING } from "@/services/scenarioMetricsService.ts";

export default function ScenarioBlock({
  scenario,
  form,
  flash,
  index,
}: {
  scenario: Scenario;
  form: OrgFormFields;
  flash: boolean;
  index: number;
}) {
  const before = useMemo(() => computeScenarioMetrics(scenario, form), [scenario, form]);
  const after = useMemo(() => computeScenarioMetrics(scenario, form, scenario.excludes), [scenario, form]);
  const ceiling = TOLERANCE_CEILING[form.fragility_tolerance];
  const aboveTolerance = after.riskScore > ceiling;
  const newlyCritical = after.critical && !before.critical;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <span className="shrink-0 inline-flex items-center justify-center size-5 rounded-full bg-success-foreground text-success text-[11px] font-semibold tabular-nums">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium leading-tight">{scenario.label}</p>
          <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{scenario.description}</p>
        </div>
      </div>
      <div className="rounded-lg border border-border p-3 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-foreground italic font-medium">
          <span>Today</span>
          <ArrowRightIcon size={9} weight="bold" />
          <span>If scenario happens</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          <MetricRow label="Bus factor" before={before.busFactor} after={after.busFactor} invertColors flash={flash} />
          <MetricRow label="Uncovered" before={before.uncovered} after={after.uncovered} flash={flash} />
          <MetricRow label="Silos" before={before.silos} after={after.silos} flash={flash} />
          <MetricRow label="Fragility" before={before.riskScore} after={after.riskScore} suffix="%" flash={flash} />
          <MetricRow
            label="Trajectory"
            before={before.healthScore}
            after={after.healthScore}
            invertColors
            suffix="%"
            flash={flash}
          />
        </div>
      </div>
      {aboveTolerance && (
        <Banner tone="warning">
          Fragility {after.riskScore}% exceeds your {form.fragility_tolerance} tolerance (≤{ceiling}%).
        </Banner>
      )}
      {newlyCritical && <Banner tone="danger">Would flag {scenario.project.name} as critical.</Banner>}
    </div>
  );
}

function Banner({ tone, children }: { tone: "warning" | "danger"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10.5px] font-medium",
        tone === "warning"
          ? "border-warning/40 bg-warning/10 text-warning"
          : "border-danger/40 bg-danger/10 text-danger",
      )}
    >
      <WarningIcon size={12} weight="fill" />
      {children}
    </div>
  );
}
