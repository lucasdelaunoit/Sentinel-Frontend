import { useRef, useState } from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import useDeleteSkillCategory from "@/api/skill-categories/useDeleteSkillCategory.ts";
import useUpdateSkillCategory from "@/api/skill-categories/useUpdateSkillCategory.ts";

interface SmallSkillCategoryCardProps {
  category: SkillCategory;
  isActive: boolean;
  onSelect: () => void;
  onDeleted?: () => void;
}

export default function SmallSkillCategoryCard({
  category,
  isActive,
  onSelect,
  onDeleted,
}: SmallSkillCategoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(category.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteSkillCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateSkillCategory();

  function handleStartEdit(e: MouseEvent) {
    e.stopPropagation();
    setDraft(category.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleConfirmEdit() {
    const name = draft.trim();
    if (!name || name === category.name) {
      setIsEditing(false);
      return;
    }
    updateCategory({ id: category.id, name }, { onSuccess: () => setIsEditing(false) });
  }

  function handleCancelEdit(e: MouseEvent) {
    e.stopPropagation();
    setIsEditing(false);
    setDraft(category.name);
  }

  return (
    <div
      onClick={isEditing ? undefined : onSelect}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors bg-tertiary cursor-pointer",
        isActive && "bg-primary/10",
      )}
    >
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmEdit();
              if (e.key === "Escape") {
                setIsEditing(false);
                setDraft(category.name);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={isUpdating}
            className="w-full text-[13px] font-semibold bg-transparent border-b border-primary/40 focus:outline-none text-foreground"
          />
        ) : (
          <p className={cn("text-[13px] font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>
            {category.name}
          </p>
        )}
        <p className="text-[11px] text-secondary-foreground/60 truncate">
          {`${category.skills_count} skill${category.skills_count !== 1 ? "s" : ""}`}
        </p>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmEdit();
            }}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            {isUpdating ? <Loader2 className="animate-spin" /> : <Check />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCancelEdit}
            disabled={isUpdating}
            className="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
          >
            <X />
          </Button>
        </div>
      ) : (
        <div className="flex items-center opacity-0 group-hover:opacity-100 shrink-0 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleStartEdit}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Pencil className="size-3.5" />
          </Button>
          <ComposedAlertDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
                className="text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            }
            title={`Delete category "${category.name}"?`}
            description="This will permanently delete the category. Skills assigned to it will lose their category."
            confirmLabel="Delete"
            pendingLabel="Deleting…"
            isPending={isDeleting}
            variant="destructive"
            onConfirm={() =>
              deleteCategory(category.id, {
                onSuccess: () => {
                  setDeleteOpen(false);
                  onDeleted?.();
                },
              })
            }
          />
        </div>
      )}
    </div>
  );
}

SmallSkillCategoryCard.Skeleton = function SmallSkillCategoryCardSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-tertiary px-2.5 py-2">
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-3.5 w-14 rounded" />
      </div>
    </div>
  );
};
