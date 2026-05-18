import ComposedCard from "@/components/common/cards/ComposedCard";
import StackedBar from "@/components/common/bars/StackedBar";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgSettingsTabProps } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { QuestionIcon } from "@phosphor-icons/react";

const TRAJECTORY_STEPS: { value: number; label: string; description: string }[] = [
  { value: 10, label: "Delivery only", description: "Progress drives the trajectory — fragility barely affects it" },
  { value: 30, label: "Delivery first", description: "Progress weighs heavier than fragility" },
  { value: 50, label: "Balanced", description: "Fragility and progress matter equally" },
  { value: 70, label: "Stability first", description: "Fragility weighs heavier than progress" },
  { value: 90, label: "Stability only", description: "Fragility drives the trajectory — progress barely affects it" },
];

export default function HealthWeightSettingsTab({ form, setForm, saveAction }: OrgSettingsTabProps) {
  const progressWeight = 100 - form.health_risk_weight;

  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>How should we judge a project's trajectory?</span>
          <Tooltip>
            <TooltipTrigger>
              <QuestionIcon />
            </TooltipTrigger>
            <TooltipContent side="right">
              Trajectory = fragility blended with delivery progress. This setting picks the blend ratio. Stability-first
              projects (compliance, infra) penalize fragility hard; delivery-first projects (MVPs, sprints) reward
              progress even when fragile.
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
        {TRAJECTORY_STEPS.map((s) => (
          <FieldLabel key={s.value} htmlFor={`trajectory-${s.value}`} className="cursor-pointer">
            <Field className="relative">
              <FieldTitle>{s.label}</FieldTitle>
              <FieldDescription>{s.description}</FieldDescription>
              <RadioGroupItem
                value={String(s.value)}
                id={`trajectory-${s.value}`}
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
            { color: "bg-danger/80", value: form.health_risk_weight, label: "Fragility" },
            { color: "bg-success/80", value: progressWeight, label: "Progress" },
          ]}
        />
        <div className="flex justify-between text-[11px] tabular-nums">
          <span className="text-danger font-semibold">Fragility weight: {form.health_risk_weight}%</span>
          <span className="text-success font-semibold">Progress weight: {progressWeight}%</span>
        </div>
      </div>
    </ComposedCard>
  );
}

HealthWeightSettingsTab.Skeleton = function HealthWeightSettingsTabSkeleton() {
  return (
    <ComposedCard title="How should we judge a project's trajectory?" headerClassName="mb-2">
      <FieldDescription className="mb-4">
        Trajectory = fragility blended with delivery progress. This setting picks the blend ratio. Stability-first
        projects (compliance, infra) penalize fragility hard; delivery-first projects (MVPs, sprints) reward progress
        even when fragile.
      </FieldDescription>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {TRAJECTORY_STEPS.map((s) => (
          <Skeleton key={s.value} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-16 w-full rounded-xl" />
    </ComposedCard>
  );
};
