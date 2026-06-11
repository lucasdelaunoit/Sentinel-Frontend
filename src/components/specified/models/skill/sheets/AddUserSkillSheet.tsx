import { useEffect, useState } from "react";
import { toast } from "sonner";
import { XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SelectorList from "@/components/common/inputs/SelectorList";
import ComposedSelect from "@/components/common/inputs/ComposedSelect";
import SkillSelectorRow from "@/components/specified/models/skill/items/SkillSelectorRow";
import SkillLevelPicker from "@/components/specified/models/skill/items/SkillLevelPicker";
import useGetSkills from "@/api/skill/useGetSkills";
import useGetSkillCategories from "@/api/skillCategory/useGetSkillCategories";
import useAttachSkillToUser from "@/api/user/useAttachSkillToUser";

interface AddUserSkillSheetProps {
  userId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCategoryId?: number | null;
}

export default function AddUserSkillSheet({
  userId,
  open,
  onOpenChange,
  initialCategoryId = null,
}: AddUserSkillSheetProps) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(initialCategoryId);

  const { data: categories = [] } = useGetSkillCategories();

  const filters: Array<{ field: string; value: string | number }> = [];
  if (userId) filters.push({ field: "not_in_user", value: userId });
  if (categoryId !== null) filters.push({ field: "category_id", value: categoryId });

  const { data: candidates, isLoading: skillsLoading } = useGetSkills({
    per_page: 50,
    search: search || undefined,
    filters: filters.length ? filters : undefined,
  });
  const { attachSkillToUser, isLoading: attaching } = useAttachSkillToUser();

  useEffect(() => {
    if (open) {
      setSearch("");
      setPicked(null);
      setLevel(null);
      setCategoryId(initialCategoryId);
    }
  }, [open, initialCategoryId]);

  function close() {
    setSearch("");
    setPicked(null);
    setLevel(null);
    onOpenChange(false);
  }

  function select(id: string) {
    setPicked((prev) => (prev === id ? null : id));
  }

  async function submit() {
    if (!userId || picked === null || level === null) return;
    try {
      await attachSkillToUser({ userId, skillId: Number(picked), level });
      toast.success("Skill added.");
      close();
    } catch {
      /* hook toasts */
    }
  }

  const canSubmit = picked !== null && level !== null && !attaching;

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) close();
      }}
      title="Add skill"
      description="Pick a skill from the catalog and set this employee's level"
      maxWidth="sm:max-w-[520px]"
      footer={
        <>
          <Button variant="outline" onClick={close} className="flex-1" disabled={attaching} size="lg">
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit} className="flex-1" size="lg">
            {attaching ? "Adding…" : "Add skill"}
          </Button>
        </>
      }
    >
      <Field>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel className="m-0">
            Skill <span className="text-destructive-foreground">*</span>
          </FieldLabel>
          <div className="flex items-center gap-1">
            <ComposedSelect<number>
              value={categoryId}
              onChange={setCategoryId}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              nullLabel="All categories"
              maxLabelWidth={120}
            />
            {categoryId !== null && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={() => setCategoryId(null)}
                aria-label="Clear category filter"
              >
                <XIcon className="size-3.5" weight="bold" />
              </Button>
            )}
          </div>
        </div>
        <SelectorList
          items={candidates}
          renderItem={(s) => (
            <SkillSelectorRow
              key={s.id}
              skill={s}
              selected={picked === s.id}
              onToggle={() => select(s.id)}
              searchTerm={search}
            />
          )}
          renderSkeleton={() => <SkillSelectorRow.Skeleton />}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search skills..."
          isLoading={skillsLoading}
          emptyMessage={
            categoryId !== null
              ? "No skills available in this category. Try clearing the filter."
              : "No skills available to add."
          }
          maxHeight="max-h-[44vh]"
        />
        <FieldDescription>Skills already attached to this employee are hidden</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>
          Proficiency level <span className="text-destructive-foreground">*</span>
        </FieldLabel>
        <SkillLevelPicker value={level} onChange={setLevel} disabled={attaching} />
        <FieldDescription>From beginner (1) to expert (5)</FieldDescription>
      </Field>
    </ComposedSheet>
  );
}
