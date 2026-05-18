import { cn } from "@/lib/utils";
import ComposedCard from "@/components/common/cards/ComposedCard";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgSettingsTabProps } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { QuestionIcon } from "@phosphor-icons/react";

function InlineNumber({
  value,
  onChange,
  min,
  max,
  width = "w-14",
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  width?: string;
}) {
  return (
    <Input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn("inline-flex h-8 px-2 text-center text-[13px] font-semibold tabular-nums align-baseline", width)}
    />
  );
}

function SentenceRow({
  icon,
  iconColor,
  children,
  example,
}: {
  icon: string;
  iconColor: string;
  children: React.ReactNode;
  example: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
      <div className={cn("flex size-7 items-center justify-center rounded-lg text-[13px] shrink-0", iconColor)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-foreground leading-relaxed flex flex-wrap items-center gap-x-1 gap-y-1.5">
          {children}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5 italic">{example}</p>
      </div>
    </div>
  );
}

export default function RulesSettingsTab({ form, setForm, saveAction }: OrgSettingsTabProps) {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Basis rules in plain English?</span>
          <Tooltip>
            <TooltipTrigger>
              <QuestionIcon />
            </TooltipTrigger>
            <TooltipContent side="right">
              Read each line as a sentence. The numbers in white boxes are editable.
            </TooltipContent>
          </Tooltip>
        </div>
      }
      footer={saveAction}
    >
      <div className="space-y-3">
        <SentenceRow
          icon="👤"
          iconColor="bg-violet-100 text-violet-700"
          example="Example: a skill known by 1 person is flagged as a silo."
        >
          A skill becomes a <strong>silo</strong> when only{" "}
          <InlineNumber
            value={form.silo_threshold}
            onChange={(v) => setForm({ ...form, silo_threshold: v })}
            min={1}
            max={5}
          />{" "}
          or fewer people on the team know it.
        </SentenceRow>

        <SentenceRow
          icon="⭐"
          iconColor="bg-amber-100 text-amber-700"
          example="Example: someone with React at level 2 doesn't count as covering React."
        >
          A team member only counts as <strong>covering</strong> a skill once they reach level{" "}
          <InlineNumber
            value={form.kci_min_level}
            onChange={(v) => setForm({ ...form, kci_min_level: v })}
            min={1}
            max={5}
          />{" "}
          (out of 5).
        </SentenceRow>

        <SentenceRow
          icon="🚨"
          iconColor="bg-rose-100 text-rose-700"
          example="Example: if losing 2 people would break a project, flag it as critical."
        >
          Flag a project as <strong>critical</strong> when its bus factor drops to{" "}
          <InlineNumber
            value={form.critical_bus_factor_threshold}
            onChange={(v) => setForm({ ...form, critical_bus_factor_threshold: v })}
            min={1}
            max={10}
          />{" "}
          or below.
        </SentenceRow>

        <SentenceRow
          icon="📅"
          iconColor="bg-blue-100 text-blue-700"
          example="Example: only leaves happening in the next two weeks affect the risk score."
        >
          When scoring upcoming risks, look{" "}
          <InlineNumber
            value={form.absence_horizon_days}
            onChange={(v) => setForm({ ...form, absence_horizon_days: v })}
            min={1}
            max={90}
            width="w-16"
          />{" "}
          days into the future.
        </SentenceRow>

        <SentenceRow
          icon="⚠️"
          iconColor="bg-orange-100 text-orange-700"
          example="Example: each broken rule on a day cuts that day's health score by 15 points."
        >
          Each rule violation on a given day cuts that day's health score by{" "}
          <InlineNumber
            value={form.rule_violation_penalty}
            onChange={(v) => setForm({ ...form, rule_violation_penalty: v })}
            min={0}
            max={100}
          />{" "}
          points (clamped to 0).
        </SentenceRow>
      </div>
    </ComposedCard>
  );
}

RulesSettingsTab.Skeleton = function RulesSettingsTabSkeleton() {
  return (
    <ComposedCard title="Rules in plain English" headerClassName="mb-5">
      <FieldDescription className="mb-4">
        Read each line as a sentence. The numbers in white boxes are editable.
      </FieldDescription>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </ComposedCard>
  );
};
