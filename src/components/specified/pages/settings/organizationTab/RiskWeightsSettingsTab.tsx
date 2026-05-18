import { cn } from "@/lib/utils";
import ComposedCard from "@/components/common/cards/ComposedCard";
import StackedBar from "@/components/common/bars/StackedBar";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgSettingsTabProps } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QuestionIcon } from "@phosphor-icons/react";
import ConcernStepper from "./components/ConcernStepper";

type RiskWeightKey = "bus" | "uncovered" | "silos" | "absence";

const RISK_WEIGHTS: {
  key: RiskWeightKey;
  formField:
    | "risk_weight_bus_factor"
    | "risk_weight_uncovered_skills"
    | "risk_weight_silos"
    | "risk_weight_absence_impact";
  title: string;
  question: string;
  barColor: string;
  dot: string;
}[] = [
  {
    key: "bus",
    formField: "risk_weight_bus_factor",
    title: "Losing key people",
    question: "How much should we worry about projects that depend on too few people?",
    barColor: "bg-danger/80",
    dot: "bg-danger/80",
  },
  {
    key: "uncovered",
    formField: "risk_weight_uncovered_skills",
    title: "Missing required skills",
    question: "How much should we worry when a project is missing skills it needs?",
    barColor: "bg-warning/80",
    dot: "bg-warning/80",
  },
  {
    key: "silos",
    formField: "risk_weight_silos",
    title: "Knowledge silos",
    question: "How much should we worry when only one person knows a skill?",
    barColor: "bg-planned/80",
    dot: "bg-planned/80",
  },
  {
    key: "absence",
    formField: "risk_weight_absence_impact",
    title: "Upcoming absences",
    question: "How much should we worry about planned leaves coming up?",
    barColor: "bg-info/80",
    dot: "bg-info/80",
  },
];

const RISK_PRESETS: { key: string; label: string; values: Record<RiskWeightKey, number> }[] = [
  { key: "balanced", label: "Balanced", values: { bus: 50, uncovered: 50, silos: 50, absence: 50 } },
  { key: "people", label: "People-loss focused", values: { bus: 100, uncovered: 25, silos: 75, absence: 25 } },
  { key: "skills", label: "Skill-gap focused", values: { bus: 25, uncovered: 100, silos: 50, absence: 25 } },
  { key: "delivery", label: "Delivery focused", values: { bus: 25, uncovered: 50, silos: 25, absence: 75 } },
];

export default function RiskWeightsSettingsTab({ form, setForm, saveAction }: OrgSettingsTabProps) {
  const totalRiskWeights =
    form.risk_weight_bus_factor +
    form.risk_weight_uncovered_skills +
    form.risk_weight_silos +
    form.risk_weight_absence_impact;

  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>What should hurt a project's risk score the most?</span>
          <Tooltip>
            <TooltipTrigger>
              <QuestionIcon />
            </TooltipTrigger>
            <TooltipContent side="right">
              Each card below is a risk concern. Bump its weight up if you want it to pull the project's risk score
              harder, down if you care less. Only the ratio between weights matters — setting all to 50 is the same as
              setting all to 10. The stacked bar shows the resulting mix.
            </TooltipContent>
          </Tooltip>
        </div>
      }
      footer={saveAction}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[11px] font-medium text-muted-foreground self-center mr-1">Quick start:</span>
        {RISK_PRESETS.map((p) => {
          const active =
            form.risk_weight_bus_factor === p.values.bus &&
            form.risk_weight_uncovered_skills === p.values.uncovered &&
            form.risk_weight_silos === p.values.silos &&
            form.risk_weight_absence_impact === p.values.absence;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  risk_weight_bus_factor: p.values.bus,
                  risk_weight_uncovered_skills: p.values.uncovered,
                  risk_weight_silos: p.values.silos,
                  risk_weight_absence_impact: p.values.absence,
                })
              }
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium border transition-all cursor-pointer",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 text-muted-foreground border-border/60 hover:bg-muted/60",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border p-3 mb-4">
        <p className="text-[11px] font-medium text-muted-foreground mb-2">How weights distribute</p>
        <StackedBar
          emptyMessage="All concerns set to zero — set at least one above zero"
          parts={RISK_WEIGHTS.map((w) => ({
            color: w.barColor,
            value: form[w.formField],
            label: w.title,
          }))}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
          {RISK_WEIGHTS.map((w) => {
            const v = form[w.formField];
            const pct = totalRiskWeights === 0 ? 0 : Math.round((v / totalRiskWeights) * 100);
            return (
              <div key={w.key} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", w.dot)} />
                <span className="text-[10px] text-muted-foreground">
                  {w.title} (<span className="font-semibold text-foreground tabular-nums">{pct}%</span>)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {RISK_WEIGHTS.map((w) => (
          <ConcernStepper
            key={w.key}
            title={w.title}
            question={w.question}
            value={form[w.formField]}
            total={totalRiskWeights}
            dot={w.dot}
            onChange={(v) => setForm({ ...form, [w.formField]: v })}
          />
        ))}
      </div>
    </ComposedCard>
  );
}

RiskWeightsSettingsTab.Skeleton = function RiskWeightsSettingsTabSkeleton() {
  return (
    <ComposedCard title="What should hurt a project's risk score the most?" headerClassName="mb-2">
      <FieldDescription className="mb-3">
        Each card below is a risk concern. Bump its weight up if you want it to pull the project's risk score harder,
        down if you care less. Only the ratio between weights matters — setting all to 50 is the same as setting all to
        10. The stacked bar shows the resulting mix.
      </FieldDescription>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-[11px] font-medium text-muted-foreground self-center mr-1">Quick start:</span>
        {RISK_PRESETS.map((p) => (
          <Skeleton key={p.key} className="h-6 w-24 rounded-full" />
        ))}
      </div>

      <Skeleton className="h-20 w-full mb-4 rounded-xl" />

      <div className="grid grid-cols-2 gap-3">
        {RISK_WEIGHTS.map((w) => (
          <Skeleton key={w.key} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </ComposedCard>
  );
};
