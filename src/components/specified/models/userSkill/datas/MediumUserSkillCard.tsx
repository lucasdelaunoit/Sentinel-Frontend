import { useState } from "react";
import { PencilSimpleIcon, TrashIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HighlightMatch } from "@/components/common/displays/HighlightMatch.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard";
import SegmentedLevelBar from "@/components/common/bars/SegmentedLevelBar";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import EditUserSkillLevelSheet from "@/components/specified/models/skill/sheets/EditUserSkillLevelSheet";
import useDetachSkillFromUser from "@/api/user/useDetachSkillFromUser";

interface UserSkillCardProps {
  userId: string;
  skill: UserSkillDetail;
  searchTerm?: string;
}

export default function MediumUserSkillCard({ userId, skill, searchTerm = "" }: UserSkillCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { detachSkillFromUser, isLoading: isDeleting } = useDetachSkillFromUser();

  const level = skill.pivot.level;

  async function confirmDelete() {
    try {
      await detachSkillFromUser({ userId, skillId: skill.id });
      setDeleteOpen(false);
    } catch {
      /* hook toasts */
    }
  }

  return (
    <>
      <SecondaryCard
        title={
          <span className="font-semibold space-x-2">
            <HighlightMatch text={skill.name} searchTerm={searchTerm} />
            {skill.category && <SkillCategoryBadge category={skill.category} />}
          </span>
        }
        className="bg-tertiary p-3"
        description={
          <div className="flex items-center gap-2 mt-2.5">
            <SegmentedLevelBar className="w-full" value={level} max={5} />
            <span>{level}/5</span>
          </div>
        }
        action={
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
              className="hover:bg-card"
              aria-label="Edit skill level"
            >
              <PencilSimpleIcon />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setDeleteOpen(true)}
              disabled={isDeleting}
              aria-label="Remove skill"
            >
              {isDeleting ? <CircleNotchIcon className="animate-spin" weight="bold" /> : <TrashIcon />}
            </Button>
          </div>
        }
      />

      <EditUserSkillLevelSheet userId={userId} skill={skill} open={editOpen} onOpenChange={setEditOpen} />
      <ComposedAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Remove "${skill.name}" from this employee?`}
        description="The skill itself stays in the catalog. Only this employee's proficiency record is removed."
        confirmLabel="Remove skill"
        pendingLabel="Removing…"
        isPending={isDeleting}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}

MediumUserSkillCard.Skeleton = function MediumUserSkillCardSkeleton() {
  return (
    <SecondaryCard
      title={
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-28 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      }
      className="bg-tertiary p-3"
      description={
        <div className="flex items-center gap-2 mt-2.5">
          <Skeleton className="h-2 flex-1 rounded-sm" />
          <Skeleton className="h-3 w-7" />
        </div>
      }
      action={
        <div className="flex items-center gap-1 ml-4 shrink-0">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      }
    />
  );
};
