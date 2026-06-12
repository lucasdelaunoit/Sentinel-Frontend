import { useState } from "react";
import { CircleNotchIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import EditSkillSheet from "@/components/specified/models/skill/sheets/EditSkillSheet.tsx";
import { HighlightMatch } from "@/components/common/displays/HighlightMatch.tsx";
import useDeleteSkill from "@/api/skill/useDeleteSkill.ts";
import useGetSkillCategories from "@/api/skillCategory/useGetSkillCategories";

interface MediumSkillCardProps {
  skill: Skill;
  searchTerm?: string;
  onDeleted?: () => void;
}

export default function MediumSkillCard({ skill, searchTerm = "", onDeleted }: MediumSkillCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { deleteSkill, isLoading: isDeleting } = useDeleteSkill();
  const { data: categories = [] } = useGetSkillCategories();

  return (
    <>
      <SecondaryCard
        key={skill.id}
        title={
          <span className="font-semibold">
            <HighlightMatch text={skill.name} searchTerm={searchTerm} />
          </span>
        }
        className="bg-tertiary p-3"
        description={<SkillCategoryBadge category={skill.category} />}
        action={
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} className="hover:bg-card">
              <PencilSimpleIcon />
            </Button>
            <ComposedAlertDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              trigger={
                <Button variant="destructive" size="icon" disabled={isDeleting}>
                  {isDeleting ? <CircleNotchIcon className="animate-spin" weight="bold" /> : <TrashIcon />}
                </Button>
              }
              title={`Delete skill "${skill.name}"?`}
              description="This will permanently delete the skill. Employees assigned to it will lose this skill."
              confirmLabel="Delete"
              pendingLabel="Deleting…"
              isPending={isDeleting}
              variant="destructive"
              onConfirm={() =>
                deleteSkill(skill.id, {
                  onSuccess: () => {
                    setDeleteOpen(false);
                    onDeleted?.();
                  },
                })
              }
            />
          </div>
        }
      />
      <EditSkillSheet open={editOpen} onOpenChange={setEditOpen} skill={skill} categories={categories} />
    </>
  );
}

MediumSkillCard.Skeleton = function MediumSkillCardSkeleton() {
  return (
    <div className="rounded-xl bg-tertiary p-3 flex items-center gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-8 rounded-md shrink-0" />
        <Skeleton className="size-8 rounded-md shrink-0" />
      </div>
    </div>
  );
};
