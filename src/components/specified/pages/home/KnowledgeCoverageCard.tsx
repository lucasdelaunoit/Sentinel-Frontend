import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CoverageRadar, { type CoverageRadarDatum } from "@/components/common/charts/CoverageRadar.tsx";
import { cn } from "@/lib/utils.ts";
import { COVERAGE } from "@/data/dashboard.ts";

function DomainChips({ domains, tone }: { domains: string[]; tone: "danger" | "success" }) {
  return (
    <div className="flex flex-wrap gap-1">
      {domains.map((d) => (
        <span
          key={d}
          className={cn(
            "rounded-full border px-1.5 py-0.5 text-[10px] font-semibold",
            tone === "danger"
              ? "border-danger/40 bg-danger/10 text-danger"
              : "border-success/40 bg-success/10 text-success",
          )}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export default function KnowledgeCoverageCard() {
  const chartData = useMemo<CoverageRadarDatum[]>(
    () => COVERAGE.domains.map((d) => ({ axis: d.axis, value: d.value, target: COVERAGE.target })),
    [],
  );

  return (
    <ComposedCard
      title="Knowledge Coverage"
      action={
        <div className="ml-auto text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">{COVERAGE.global}%</p>
          <p className="text-[10px] text-muted-foreground">{COVERAGE.underCovered} under-covered</p>
        </div>
      }
      className="flex flex-col"
    >
      <CoverageRadar data={chartData} />

      <div className="mt-1 space-y-3 border-t border-border/40 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Weakest domains
            </p>
            <DomainChips domains={COVERAGE.weakest} tone="danger" />
          </div>
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Strongest domains
            </p>
            <DomainChips domains={COVERAGE.strongest} tone="success" />
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-2.5">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-danger" />
          <p className="text-[11px] font-medium text-foreground">{COVERAGE.issue}</p>
        </div>
      </div>
    </ComposedCard>
  );
}
