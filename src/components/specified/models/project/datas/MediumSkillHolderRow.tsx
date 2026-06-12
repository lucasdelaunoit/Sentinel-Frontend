import { CircleNotchIcon, TrashIcon } from "@phosphor-icons/react";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { HighlightMatch } from "@/components/common/displays/HighlightMatch.tsx";
import { getFullName } from "@/utils/formatters/persons.ts";
import { skillLevelLabel, SKILL_LEVEL_MAX } from "@/lib/theme/skillLevel.ts";

interface MediumSkillHolderRowProps {
  holder: ProjectKnowledgeCoverageHolder;
  search?: string;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
  removing?: boolean;
}

export default function MediumSkillHolderRow({
  holder,
  search = "",
  className,
  onClick,
  onRemove,
  removing = false,
}: MediumSkillHolderRowProps) {
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
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="text-[12px] font-semibold text-muted-foreground tabular-nums whitespace-nowrap">
            {skillLevelLabel(holder.level)} ({holder.level}/{SKILL_LEVEL_MAX})
          </span>
          {onRemove && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={removing}
              onClick={onRemove}
              aria-label={`Remove ${getFullName(holder.firstname, holder.lastname)} from this skill`}
            >
              {removing ? <CircleNotchIcon className="animate-spin" weight="bold" /> : <TrashIcon className="size-3.5" />}
            </Button>
          )}
        </div>
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
