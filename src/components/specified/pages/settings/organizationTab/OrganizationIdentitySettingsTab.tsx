import { Field, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { Input } from "@/components/ui/input.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { OrgFormFields, OrgSettingsTabProps } from "./types";

const RISK_TOLERANCE_OPTIONS = [
  {
    value: "conservative",
    label: "Conservative",
    description: "Lower sensitivity, fewer alerts",
    sub: "Best for regulated environments",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "Standard thresholds",
    sub: "General-purpose teams",
  },
  {
    value: "aggressive",
    label: "Aggressive",
    description: "Higher sensitivity, more alerts",
    sub: "High-velocity or critical teams",
  },
] as const;

export default function OrganizationIdentitySettingsTab({ form, setForm, saveAction }: OrgSettingsTabProps) {
  return (
    <ComposedCard title="Identity" footer={saveAction}>
      <Field>
        <FieldLabel>Organization Name</FieldLabel>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>

      <Field className="mt-5">
        <FieldLabel>Fragility Tolerance</FieldLabel>
        <FieldDescription>Global multiplier applied to fragility sensitivity.</FieldDescription>
        <RadioGroup
          value={form.risk_tolerance}
          onValueChange={(v) => setForm({ ...form, risk_tolerance: v as OrgFormFields["risk_tolerance"] })}
          className="grid-cols-3 mt-2"
        >
          {RISK_TOLERANCE_OPTIONS.map((opt) => (
            <FieldLabel key={opt.value} htmlFor={`risk-tol-${opt.value}`} className="cursor-pointer">
              <Field className="relative">
                <FieldTitle>{opt.label}</FieldTitle>
                <FieldDescription>
                  {opt.description} - <i>{opt.sub}</i>
                </FieldDescription>
                <RadioGroupItem
                  value={opt.value}
                  id={`risk-tol-${opt.value}`}
                  className="absolute top-2.5 right-2.5 w-4!"
                />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
      </Field>
    </ComposedCard>
  );
}

OrganizationIdentitySettingsTab.Skeleton = function OrganizationIdentitySettingsTabSkeleton() {
  return (
    <ComposedCard title="Identity" headerClassName="mb-5">
      <Field>
        <FieldLabel>Organization Name</FieldLabel>
        <Skeleton className="h-9 w-full" />
      </Field>

      <Field className="mt-5">
        <FieldLabel>Fragility Tolerance</FieldLabel>
        <FieldDescription>Global multiplier applied to fragility sensitivity.</FieldDescription>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {RISK_TOLERANCE_OPTIONS.map((opt) => (
            <Skeleton key={opt.value} className="h-20 w-full" />
          ))}
        </div>
      </Field>
    </ComposedCard>
  );
};
