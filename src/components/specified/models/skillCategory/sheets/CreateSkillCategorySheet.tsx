import { useState } from "react";
import { AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import useCreateSkillCategory from "@/api/skill-categories/useCreateSkillCategory.ts";
import { cn } from "@/lib/utils.ts";

const MAX_NAME_LENGTH = 32;

interface CreateSkillCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SkillCategory[];
  maxCategories: number;
}

function validate(name: string, categories: SkillCategory[]): string | null {
  if (!name.trim()) return "Name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  if (name.trim().length > MAX_NAME_LENGTH) return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  if (categories.some((c) => c.name === name.trim().toUpperCase())) return "A category with this name already exists.";
  return null;
}

const fieldCls =
  "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

export default function CreateSkillCategorySheet({
  open,
  onOpenChange,
  categories,
  maxCategories,
}: CreateSkillCategorySheetProps) {
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const { mutate: createCategory, isPending } = useCreateSkillCategory();

  const normalizedName = name.trim().toUpperCase();
  const error = touched ? validate(name, categories) : null;
  const isDisabled = !!validate(name, categories) || isPending;

  function handleClose() {
    setName("");
    setTouched(false);
    onOpenChange(false);
  }

  function handleSubmit() {
    setTouched(true);
    const validationError = validate(name, categories);
    if (validationError) return;

    createCategory({ name: normalizedName }, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Add Category"
      description="Categories group skills and define radar chart axes"
      icon={<Layers className="size-4 text-primary" />}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} className="flex-1 rounded-xl" disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? "Adding…" : "Add Category"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
            Category Name
          </label>
          <input
            type="text"
            placeholder="e.g. MOBILE, DATA SCIENCE"
            value={name}
            onChange={(e) => {
              setName(e.target.value.toUpperCase());
              if (!touched) setTouched(true);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
            maxLength={MAX_NAME_LENGTH + 1}
            className={cn(
              fieldCls,
              touched && error && "border-destructive/60 focus:ring-destructive/30 focus:border-destructive/40",
            )}
          />
          {touched && error ? (
            <p className="text-[11px] text-destructive-foreground">{error}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">Will appear as a radar chart axis</p>
          )}
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="size-3.5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-amber-700">
              {categories.length}/{maxCategories} categories used
            </p>
            <p className="text-[11px] text-amber-600 mt-0.5">
              Radar charts become unreadable beyond {maxCategories} axes. This is the enforced maximum.
            </p>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide">
              Existing categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className={cn(
                    "text-[11px] font-semibold rounded-full px-2.5 py-1 transition-colors",
                    normalizedName && cat.name === normalizedName
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ComposedSheet>
  );
}
