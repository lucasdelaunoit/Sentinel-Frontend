import ComposedCard from "@/components/common/cards/ComposedCard";
import { Field, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgSettingsTabProps } from "./types";

const HEALTH_STEPS: { value: number; label: string; description: string }[] = [
  { value: 10, label: "Delivery only", description: "Progress drives the score — risk barely affects it" },
  { value: 30, label: "Delivery first", description: "Progress weighs heavier than risk" },
  { value: 50, label: "Balanced", description: "Risk and progress matter equally" },
  { value: 70, label: "Stability first", description: "Risk weighs heavier than progress" },
  { value: 90, label: "Stability only", description: "Risk drives the score — progress barely affects it" },
];

export default function HealthWeightSettingsTab({ form, setForm }: OrgSettingsTabProps) {
  const progressWeight = 100 - form.health_risk_weight;

  return (
    <ComposedCard title="How should we judge overall project health?" headerClassName="mb-2">
      <FieldDescription className="mb-4">
        A project's health combines two things: how risky it is, and how far along it is. Pick which one should matter
        more.
      </FieldDescription>

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
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted/40 mb-2">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
            style={{ width: `${form.health_risk_weight}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            style={{ width: `${progressWeight}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] tabular-nums">
          <span className="text-rose-600 font-semibold">Risk weight: {form.health_risk_weight}%</span>
          <span className="text-emerald-600 font-semibold">Progress weight: {progressWeight}%</span>
        </div>
      </div>
    </ComposedCard>
  );
}

HealthWeightSettingsTab.Skeleton = function HealthWeightSettingsTabSkeleton() {
  return (
    <ComposedCard title="How should we judge overall project health?" headerClassName="mb-2">
      <FieldDescription className="mb-4">
        A project's health combines two things: how risky it is, and how far along it is. Pick which one should matter
        more.
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
