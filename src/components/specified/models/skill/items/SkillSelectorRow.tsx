import { Skeleton } from "@/components/ui/skeleton";
import SelectorRow from "@/components/common/inputs/SelectorRow";
import { HighlightMatch } from "@/utils/useHighlightableText";

interface SkillSelectorRowProps {
  skill: Skill;
  selected: boolean;
  onToggle: () => void;
  searchTerm?: string;
}

export default function SkillSelectorRow({ skill, selected, onToggle, searchTerm = "" }: SkillSelectorRowProps) {
  return (
    <SelectorRow active={selected} onClick={onToggle}>
      <span className="flex-1 text-[13px] font-semibold text-foreground truncate">
        <HighlightMatch text={skill.name} searchTerm={searchTerm} />
      </span>
      {skill.category?.name && (
        <span className="text-[11.5px] text-muted-foreground shrink-0">{skill.category.name}</span>
      )}
    </SelectorRow>
  );
}

SkillSelectorRow.Skeleton = function SkillSelectorRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <Skeleton className="size-6 rounded-md shrink-0" />
      <Skeleton className="h-3.5 flex-1 max-w-[45%]" />
      <Skeleton className="h-3 w-20 shrink-0" />
    </div>
  );
};
