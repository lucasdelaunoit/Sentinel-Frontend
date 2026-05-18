import ComposedCard from "@/components/common/cards/ComposedCard";
import { FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgSettingsTabProps } from "./types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { CalendarIcon, FlagIcon, QuestionIcon, ScissorsIcon, UserIcon, UsersIcon } from "@phosphor-icons/react";
import RuleSentenceRow, {
  InlineNumberInput,
} from "@/components/specified/pages/settings/organizationTab/components/RuleSentenceRow.tsx";

export default function RulesSettingsTab({ form, setForm, saveAction }: OrgSettingsTabProps) {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Rules in plain English</span>
          <Tooltip>
            <TooltipTrigger>
              <QuestionIcon />
            </TooltipTrigger>
            <TooltipContent side="right">
              These thresholds define when Sentinel flags silos, critical projects, and skill coverage gaps. Edit the
              boxed numbers — each sentence reads how the rule will actually apply.
            </TooltipContent>
          </Tooltip>
        </div>
      }
      footer={saveAction}
    >
      <div className="space-y-3">
        <RuleSentenceRow icon={UserIcon} example="Example: a skill known by 1 person is flagged as a silo.">
          A skill becomes a <strong>silo</strong> when only{" "}
          <InlineNumberInput
            value={form.silo_threshold}
            onChange={(v) => setForm({ ...form, silo_threshold: v })}
            min={1}
            max={5}
          />{" "}
          or fewer people on the team know it.
        </RuleSentenceRow>

        <RuleSentenceRow
          icon={UsersIcon}
          example="Example: someone with React at level 2 doesn't count as covering React."
        >
          A team member only counts as <strong>covering</strong> a skill once they reach level{" "}
          <InlineNumberInput
            value={form.kci_min_level}
            onChange={(v) => setForm({ ...form, kci_min_level: v })}
            min={1}
            max={5}
          />{" "}
          (out of 5).
        </RuleSentenceRow>

        <RuleSentenceRow
          icon={FlagIcon}
          example="Example: if losing 2 people would break a project, flag it as critical."
        >
          Flag a project as <strong>critical</strong> when its bus factor drops to{" "}
          <InlineNumberInput
            value={form.critical_bus_factor_threshold}
            onChange={(v) => setForm({ ...form, critical_bus_factor_threshold: v })}
            min={1}
            max={10}
          />{" "}
          or below.
        </RuleSentenceRow>

        <RuleSentenceRow
          icon={CalendarIcon}
          example="Example: only leaves happening in the next two weeks affect the risk score."
        >
          When scoring upcoming risks, look{" "}
          <InlineNumberInput
            value={form.absence_horizon_days}
            onChange={(v) => setForm({ ...form, absence_horizon_days: v })}
            min={1}
            max={90}
            width="w-16"
          />{" "}
          days into the future.
        </RuleSentenceRow>

        <RuleSentenceRow
          icon={ScissorsIcon}
          example="Example: each broken rule on a day cuts that day's health score by 15 points."
        >
          Each rule violation on a given day cuts that day's health score by{" "}
          <InlineNumberInput
            value={form.rule_violation_penalty}
            onChange={(v) => setForm({ ...form, rule_violation_penalty: v })}
            min={0}
            max={100}
          />{" "}
          points (clamped to 0).
        </RuleSentenceRow>
      </div>
    </ComposedCard>
  );
}

RulesSettingsTab.Skeleton = function RulesSettingsTabSkeleton() {
  return (
    <ComposedCard title="Rules in plain English" headerClassName="mb-5">
      <FieldDescription className="mb-4">
        These thresholds define when Sentinel flags silos, critical projects, and skill coverage gaps. Edit the boxed
        numbers — each sentence reads how the rule will actually apply.
      </FieldDescription>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </ComposedCard>
  );
};
