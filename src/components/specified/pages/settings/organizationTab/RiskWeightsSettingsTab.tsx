import { cn } from "@/lib/utils";
import ComposedCard from "@/components/common/cards/ComposedCard";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgSettingsTabProps } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QuestionIcon } from "@phosphor-icons/react";

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
    barColor: "bg-rose-500",
    dot: "bg-rose-500",
  },
  {
    key: "uncovered",
    formField: "risk_weight_uncovered_skills",
    title: "Missing required skills",
    question: "How much should we worry when a project is missing skills it needs?",
    barColor: "bg-amber-500",
    dot: "bg-amber-500",
  },
  {
    key: "silos",
    formField: "risk_weight_silos",
    title: "Knowledge silos",
    question: "How much should we worry when only one person knows a skill?",
    barColor: "bg-violet-500",
    dot: "bg-violet-500",
  },
  {
    key: "absence",
    formField: "risk_weight_absence_impact",
    title: "Upcoming absences",
    question: "How much should we worry about planned leaves coming up?",
    barColor: "bg-blue-500",
    dot: "bg-blue-500",
  },
];

const RISK_PRESETS: { key: string; label: string; values: Record<RiskWeightKey, number> }[] = [
  { key: "balanced", label: "Balanced", values: { bus: 50, uncovered: 50, silos: 50, absence: 50 } },
  { key: "people", label: "People-loss focused", values: { bus: 100, uncovered: 25, silos: 75, absence: 25 } },
  { key: "skills", label: "Skill-gap focused", values: { bus: 25, uncovered: 100, silos: 50, absence: 25 } },
  { key: "delivery", label: "Delivery focused", values: { bus: 25, uncovered: 50, silos: 25, absence: 75 } },
];

const CONCERN_STEPS: { value: number; label: string; short: string }[] = [
  { value: 0, label: "Ignore", short: "Don't factor this in" },
  { value: 25, label: "Minor", short: "Mention, low priority" },
  { value: 50, label: "Moderate", short: "Standard concern" },
  { value: 75, label: "Major", short: "Push the score noticeably" },
  { value: 100, label: "Critical", short: "Dominant concern" },
];

function nearestStep(value: number): number {
  return CONCERN_STEPS.reduce(
    (best, s) => (Math.abs(s.value - value) < Math.abs(best - value) ? s.value : best),
    CONCERN_STEPS[0].value,
  );
}

function ConcernSlider({
  title,
  question,
  value,
  total,
  dot,
  onChange,
}: {
  title: string;
  question: string;
  value: number;
  total: number;
  dot: string;
  onChange: (v: number) => void;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  const current = nearestStep(value);
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-start gap-2.5 mb-3">
        <span className={cn("mt-1.5 size-2 rounded-full shrink-0", dot)} />
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{question}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[13px] font-semibold text-foreground tabular-nums">{pct}%</div>
          <div className="text-[10px] text-muted-foreground">of total</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {CONCERN_STEPS.map((s) => {
          const active = current === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              className={cn(
                "rounded-lg border px-1 py-1.5 text-center transition-all cursor-pointer",
                active
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
              title={s.short}
            >
              <div className="text-[11px] font-semibold leading-tight">{s.label}</div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/80 mt-2 italic">
        {CONCERN_STEPS.find((s) => s.value === current)?.short}
      </p>
    </div>
  );
}

function StackedWeightBar({ parts }: { parts: { color: string; value: number; label: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total === 0) {
    return (
      <div className="h-3 w-full rounded-full bg-muted/40 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground">
          All concerns set to zero — set at least one above zero
        </span>
      </div>
    );
  }
  return (
    <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/40">
      {parts.map((p, i) => {
        const w = (p.value / total) * 100;
        if (w === 0) return null;
        return (
          <div
            key={i}
            className={cn("h-full", p.color)}
            style={{ width: `${w}%` }}
            title={`${p.label}: ${Math.round(w)}%`}
          />
        );
      })}
    </div>
  );
}

export default function RiskWeightsSettingsTab({ form, setForm }: OrgSettingsTabProps) {
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
              Drag each slider based on how worried you are about that concern. The bar below shows how they balance out
              — only their relative size matters.
            </TooltipContent>
          </Tooltip>
        </div>
      }
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

      <div className="rounded-xl bg-muted/30 border border-border/40 p-3 mb-4">
        <p className="text-[11px] font-medium text-muted-foreground mb-2">How weights distribute</p>
        <StackedWeightBar
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
                  {w.title} <span className="font-semibold text-foreground tabular-nums">{pct}%</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {RISK_WEIGHTS.map((w) => (
          <ConcernSlider
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
        Drag each slider based on how worried you are about that concern. The bar below shows how they balance out —
        only their relative size matters.
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
