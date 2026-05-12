import { useRef, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteSkillCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateSkillCategory();

  function handleStartEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(category.name);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleConfirmEdit() {
    const name = draft.trim().toUpperCase();
    if (!name || name === category.name) {
      setIsEditing(false);
      return;
    }
    updateCategory({ id: category.id, name }, { onSuccess: () => setIsEditing(false) });
  }

  function handleCancelEdit(e: React.MouseEvent) {
    e.stopPropagation();
    setIsEditing(false);
    setDraft(category.name);
  }

  return (
    <div
      onClick={isEditing ? undefined : onSelect}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors",
        isEditing ? "bg-muted/60" : cn("cursor-pointer", isActive ? "bg-primary/10" : "hover:bg-muted/50"),
      )}
    >
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmEdit();
              if (e.key === "Escape") { setIsEditing(false); setDraft(category.name); }
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={isUpdating}
            className="w-full text-[12px] font-semibold bg-transparent border-b border-primary/40 focus:outline-none text-foreground"
          />
        ) : (
          <p className={cn("text-[12px] font-semibold truncate", isActive ? "text-primary" : "text-foreground")}>
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
            size="icon-xs"
            onClick={(e) => { e.stopPropagation(); handleConfirmEdit(); }}
            disabled={isUpdating}
            className="text-muted-foreground/60 hover:text-emerald-600 hover:bg-emerald-50"
          >
            <Check />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCancelEdit}
            className="text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50"
          >
            <X />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleStartEdit}
            className="text-muted-foreground/40 hover:text-primary hover:bg-primary/10"
          >
            <Pencil />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
                className="text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50"
              >
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete category "{category.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the category. Skills assigned to it will lose their category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteCategory(category.id, { onSuccess: onDeleted })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

SmallSkillCategoryCard.Skeleton = function SmallSkillCategoryCardSkeleton() {
  return (
    <div className="flex items-center gap-2 px-2.5 py-2">
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-2 w-12 rounded" />
      </div>
      <Skeleton className="h-3 w-4 rounded" />
    </div>
  );
};
