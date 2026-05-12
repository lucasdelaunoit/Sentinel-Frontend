import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TrashIcon } from "@phosphor-icons/react";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface MediumSkillCardProps {
  skill: Skill;
  isLoading?: boolean;
}

export default function MediumSkillCard({ skill, isLoading = false }: MediumSkillCardProps) {
  if (isLoading) return <MediumSkillCard.Skeleton />;

  return (
    <SecondaryCard
      key={skill.id}
      title={skill.name}
      className="bg-secondary p-3"
      description={<SkillCategoryBadge category={skill.category} />}
      action={
        <Button variant="destructive" size="icon">
          <TrashIcon />
        </Button>
      }
    />
  );
}

MediumSkillCard.Skeleton = function MediumSkillCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary p-3 flex items-center gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-24 rounded-md" />
        <Skeleton className="h-3.5 w-16 rounded-full" />
      </div>
      <Skeleton className="size-8 rounded-md shrink-0" />
    </div>
  );
};
