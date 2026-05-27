import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import RiskBadge from "@/components/specified/pages/home/_shared/RiskBadge.tsx";
import TrendIndicator from "@/components/specified/pages/home/_shared/TrendIndicator.tsx";
import RedundancyBar from "@/components/specified/pages/home/_shared/RedundancyBar.tsx";
import { RISK_TONE, VULNERABLE_SKILLS, type VulnerableSkill } from "@/data/dashboard.ts";

function VulnerableSkillRow({ skill }: { skill: VulnerableSkill }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-foreground">{skill.name}</p>
        <RiskBadge level={skill.risk} size="sm" />
      </div>
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{skill.qualified}</span> qualified
          <span className="mx-1.5 opacity-40">·</span>
          {skill.projects} projects
          <span className="mx-1.5 opacity-40">·</span>
          {skill.missingBackups} missing backup{skill.missingBackups !== 1 ? "s" : ""}
        </span>
        <TrendIndicator trend={skill.trend} showLabel={false} />
      </div>
      <RedundancyBar qualified={skill.qualified} needed={skill.needed} tone={RISK_TONE[skill.risk]} />
    </div>
  );
}

export default function VulnerableSkillsCard() {
  return (
    <ComposedCard
      title="Most Vulnerable Skills"
      action={<span className="ml-auto text-xs text-secondary-foreground">knowledge silos</span>}
      className="flex flex-col"
    >
      <div className="space-y-3">
        {VULNERABLE_SKILLS.map((s) => (
          <VulnerableSkillRow key={s.id} skill={s} />
        ))}
      </div>
    </ComposedCard>
  );
}
