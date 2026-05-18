import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { QuestionIcon } from "@phosphor-icons/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import type { OrgFormFields } from "../types.ts";
import ScenarioBlock from "@/components/specified/pages/settings/organizationTab/scenarioCard/ScenarioBlock.tsx";
import type { Scenario, ScenarioMember, ScenarioProject } from "@/services/scenarioMetricsService.ts";

const TEAM: ScenarioMember[] = [
  { name: "Alice", role: "Lead Backend", skills: { React: 4, Node: 5, TypeScript: 4 } },
  { name: "Bob", role: "Fullstack", skills: { React: 2, Postgres: 4, TypeScript: 3 } },
  { name: "Carol", role: "Frontend", skills: { React: 3, TypeScript: 3 } },
  { name: "Dan", role: "DevOps", skills: { DevOps: 4, Postgres: 2 } },
];

const ATLAS: ScenarioProject = {
  name: "Atlas",
  progress: 60,
  requiredSkills: ["React", "Node", "Postgres", "TypeScript"],
};
const NOVA: ScenarioProject = { name: "Nova", progress: 40, requiredSkills: ["React", "Postgres", "DevOps"] };

const SCENARIOS: Scenario[] = [
  {
    id: "lead-leaves",
    label: "Lead backend leaves",
    description: "Alice (Lead Backend, sole Node expert) resigns from Atlas.",
    team: TEAM,
    project: ATLAS,
    excludes: ["Alice"],
  },
  {
    id: "two-on-leave",
    label: "Two on parental leave",
    description: "Bob and Carol both out for 3 months on Nova.",
    team: TEAM,
    project: NOVA,
    excludes: ["Bob", "Carol"],
  },
  {
    id: "devops-gap",
    label: "DevOps specialist lost",
    description: "Dan, the only DevOps engineer, leaves project Nova.",
    team: TEAM,
    project: NOVA,
    excludes: ["Dan"],
  },
];

export default function ScenarioPreviewCard({ form, flash = false }: { form: OrgFormFields; flash?: boolean }) {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Live preview</span>
          <Tooltip>
            <TooltipTrigger>
              <QuestionIcon />
            </TooltipTrigger>
            <TooltipContent side="right">
              Three what-if scenarios. Tweak settings and watch each verdict shift.
            </TooltipContent>
          </Tooltip>
        </div>
      }
    >
      <div className="space-y-4">
        {SCENARIOS.map((s, i) => (
          <ScenarioBlock key={s.id} scenario={s} form={form} flash={flash} index={i} />
        ))}
      </div>
    </ComposedCard>
  );
}
