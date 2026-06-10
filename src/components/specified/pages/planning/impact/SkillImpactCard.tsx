import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import SkillImpactRow from "@/components/specified/models/skill/datas/items/SkillImpactRow.tsx";

interface SkillImpactCardProps {
  skills: SkillImpact[];
}

export default function SkillImpactCard({ skills }: SkillImpactCardProps) {
  const order: Severity[] = ["critical", "warning", "ok"];
  const sorted = [...skills].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Impacted Skills</span>
          <CountDisplay count={skills.length} />
        </div>
      }
    >
      {skills.length === 0 ? (
        <Feedback variant="success" title="No skill impact" description="All skills remain covered." />
      ) : (
        <div className="space-y-2">
          {sorted.map((s) => (
            <SkillImpactRow key={s.skill_id} skill={s} />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

SkillImpactCard.Skeleton = function SkillImpactCardSkeleton() {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Impacted Skills</span>
          <CountDisplay isLoading count={0} />
        </div>
      }
    >
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkillImpactRow.Skeleton key={i} />
        ))}
      </div>
    </ComposedCard>
  );
};
