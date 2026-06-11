import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { HighlightMatch } from "@/utils/useHighlightableText.tsx";
import { getFullName } from "@/utils/formatters/persons.ts";
import { skillLevelLabel, SKILL_LEVEL_MAX } from "@/lib/theme/skillLevel.ts";

interface MediumSkillHolderRowProps {
  holder: ProjectKnowledgeCoverageHolder;
  search?: string;
  className?: string;
  onClick?: () => void;
}

export default function MediumSkillHolderRow({ holder, search = "", className, onClick }: MediumSkillHolderRowProps) {
  return (
    <SecondaryCard
      className={className}
      onClick={onClick}
      before={<UserAvatar firstname={holder.firstname} lastname={holder.lastname} variant={holder.status} />}
      title={<HighlightMatch text={getFullName(holder.firstname, holder.lastname)} searchTerm={search} />}
      description={
        holder.on_leave_today ? <span className="text-warning font-medium">On leave today</span> : undefined
      }
      action={
        <span className="text-[12px] font-semibold text-muted-foreground tabular-nums whitespace-nowrap">
          {skillLevelLabel(holder.level)} ({holder.level}/{SKILL_LEVEL_MAX})
        </span>
      }
    />
  );
}

MediumSkillHolderRow.Skeleton = function MediumSkillHolderRowSkeleton() {
  return (
    <SecondaryCard
      before={<UserAvatar.Skeleton />}
      title={<Skeleton className="h-3.5 w-32" />}
      action={<Skeleton className="h-3.5 w-20" />}
    />
  );
};
