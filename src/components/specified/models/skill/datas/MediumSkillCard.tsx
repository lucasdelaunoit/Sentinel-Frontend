import { Badge } from "@/components/ui/badge.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TrashIcon } from "@phosphor-icons/react";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";

interface MediumSkillCardProps {
  skill: Skill;
}

export default function MediumSkillCard({ skill }: MediumSkillCardProps) {
  function handleDelete(id: string) {}

  return (
    <SecondaryCard
      key={skill.id}
      title={skill.name}
      className="bg-secondary p-3"
      description={<SkillCategoryBadge category={skill.category} />}
      action={
        <>
          <Button variant="destructive" size="icon">
            <TrashIcon />
          </Button>
        </>
      }
    />
  );
}

{
  /*<SecondaryCard
      key={skill.id}
      className="group rounded-xl border border-border/60 bg-background p-3.5 flex items-start gap-3 hover:shadow-sm hover:border-border transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{skill.name}</p>
          <Button
            onClick={() => handleDelete(skill.id)}
            size="sm"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 h-5 w-5 p-0 -mt-0.5 -mr-0.5 shrink-0 text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50/50 rounded transition-all"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
        <Badge variant="secondary" className="mt-1">
          {skill.category}
        </Badge>
        <span className="text-[10px] font-semibold text-muted-foreground/50 bg-muted/50 rounded-full px-2 py-0.5 uppercase tracking-wide mt-1.5 inline-block border border-border/40">
          {skill.category}
        </span>
      </div>
    </SecondaryCard>*/
}
