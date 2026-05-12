import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TrashIcon } from "@phosphor-icons/react";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";
import { HighlightMatch } from "@/utils/useHighlightableText.tsx";
import useDeleteSkill from "@/api/skills/useDeleteSkill.ts";

interface MediumSkillCardProps {
  skill: Skill;
  searchTerm?: string;
  onDeleted?: () => void;
}

export default function MediumSkillCard({ skill, searchTerm = "", onDeleted }: MediumSkillCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteSkill, isPending: isDeleting } = useDeleteSkill();

  return (
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
        <AlertDialog open={deleteOpen} onOpenChange={(v) => !isDeleting && setDeleteOpen(v)}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="animate-spin" /> : <TrashIcon />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete skill "{skill.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the skill. Employees assigned to it will lose this skill.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={(e) => {
                  e.preventDefault();
                  deleteSkill(skill.id, {
                    onSuccess: () => {
                      setDeleteOpen(false);
                      onDeleted?.();
                    },
                  });
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
