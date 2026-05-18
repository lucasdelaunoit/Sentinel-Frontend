import ComposedCard from "@/components/common/cards/ComposedCard";
import StackedBar from "@/components/common/bars/StackedBar";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgSettingsTabProps } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { QuestionIcon } from "@phosphor-icons/react";

const HEALTH_STEPS: { value: number; label: string; description: string }[] = [
  { value: 10, label: "Delivery only", description: "Progress drives the score — risk barely affects it" },
  { value: 30, label: "Delivery first", description: "Progress weighs heavier than risk" },
  { value: 50, label: "Balanced", description: "Risk and progress matter equally" },
  { value: 70, label: "Stability first", description: "Risk weighs heavier than progress" },
  { value: 90, label: "Stability only", description: "Risk drives the score — progress barely affects it" },
];

export default function HealthWeightSettingsTab({ form, setForm, saveAction }: OrgSettingsTabProps) {
  const progressWeight = 100 - form.health_risk_weight;

  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>How should we judge overall project health?</span>
          <Tooltip>
            <TooltipTrigger>
              <QuestionIcon />
            </TooltipTrigger>
            <TooltipContent side="right">
              Project health = risk score blended with delivery progress. This setting picks the blend ratio.
              Stability-first projects (compliance, infra) penalize risk hard; delivery-first projects (MVPs, sprints)
              reward progress even when risky.
            </TooltipContent>
          </Tooltip>
        </div>
      }
      footer={saveAction}
    >
      <RadioGroup
        value={String(form.health_risk_weight)}
        onValueChange={(v) => setForm({ ...form, health_risk_weight: Number(v) })}
        className="grid-cols-5 mb-4"
      >
        {HEALTH_STEPS.map((s) => (
          <FieldLabel key={s.value} htmlFor={`health-${s.value}`} className="cursor-pointer">
            <Field className="relative">
              <FieldTitle>{s.label}</FieldTitle>
              <FieldDescription>{s.description}</FieldDescription>
              <RadioGroupItem
                value={String(s.value)}
                id={`health-${s.value}`}
                className="absolute top-2.5 right-2.5 w-4!"
              />
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>

      <div className="rounded-xl bg-muted/30 border border-border/40 p-4">
        <StackedBar
          className="mb-2"
          parts={[
            { color: "bg-danger/80", value: form.health_risk_weight, label: "Risk" },
            { color: "bg-success/80", value: progressWeight, label: "Progress" },
          ]}
        />
        <div className="flex justify-between text-[11px] tabular-nums">
          <span className="text-danger font-semibold">Risk weight: {form.health_risk_weight}%</span>
          <span className="text-success font-semibold">Progress weight: {progressWeight}%</span>
        </div>
      </div>
    </ComposedCard>
  );
}

HealthWeightSettingsTab.Skeleton = function HealthWeightSettingsTabSkeleton() {
  return (
    <ComposedCard title="How should we judge overall project health?" headerClassName="mb-2">
      <FieldDescription className="mb-4">
        Project health = risk score blended with delivery progress. This setting picks the blend ratio. Stability-first
        projects (compliance, infra) penalize risk hard; delivery-first projects (MVPs, sprints) reward progress even
        when risky.
      </FieldDescription>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {HEALTH_STEPS.map((s) => (
          <Skeleton key={s.value} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-16 w-full rounded-xl" />
    </ComposedCard>
  );
};
