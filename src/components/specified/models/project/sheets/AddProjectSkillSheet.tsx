import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CertificateIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button.tsx";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field.tsx";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import SelectorList from "@/components/common/inputs/SelectorList.tsx";
import ComposedSelect from "@/components/common/inputs/ComposedSelect.tsx";
import SkillSelectorRow from "@/components/specified/models/skill/items/SkillSelectorRow.tsx";
import SkillLevelPicker from "@/components/specified/models/skill/items/SkillLevelPicker.tsx";
import useGetSkills from "@/api/skill/useGetSkills.ts";
import useGetSkillCategories from "@/api/skillCategory/useGetSkillCategories.ts";
import useAddProjectSkillRequirement from "@/api/projects/useAddProjectSkillRequirement.ts";

interface AddProjectSkillSheetProps {
  projectId: string | undefined;
  /** Skill ids already required by the project — hidden from the catalog. */
  existingSkillIds: number[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddProjectSkillSheet({
  projectId,
  existingSkillIds,
  open,
  onOpenChange,
}: AddProjectSkillSheetProps) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<number | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const { data: categories = [] } = useGetSkillCategories();

  const filters: Array<{ field: string; value: string | number }> = [];
  if (categoryId !== null) filters.push({ field: "category_id", value: categoryId });

  const { data: candidates, isLoading: skillsLoading } = useGetSkills({
    per_page: 50,
    search: search || undefined,
    filters: filters.length ? filters : undefined,
  });
  const { addProjectSkillRequirement, isLoading: adding } = useAddProjectSkillRequirement();

  const available = useMemo(
    () => candidates.filter((s) => !existingSkillIds.includes(Number(s.id))),
    [candidates, existingSkillIds],
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setPicked(null);
      setLevel(null);
      setCategoryId(null);
    }
  }, [open]);

  function close() {
    setSearch("");
    setPicked(null);
    setLevel(null);
    onOpenChange(false);
  }

  function select(id: number) {
    setPicked((prev) => (prev === id ? null : id));
  }

  async function submit() {
    if (!projectId || picked === null || level === null) return;
    try {
      await addProjectSkillRequirement({ projectId, skillId: picked, requiredLevel: level });
      toast.success("Required skill added.");
      close();
    } catch {
      /* hook toasts */
    }
  }

  const canSubmit = picked !== null && level !== null && !adding;

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) close();
      }}
      title="Add required skill"
      description="Pick a skill the project needs and set the target level"
      icon={<CertificateIcon className="size-4 text-primary" />}
      maxWidth="sm:max-w-[520px]"
      footer={
        <>
          <Button variant="outline" onClick={close} className="flex-1" disabled={adding} size="lg">
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit} className="flex-1" size="lg">
            {adding ? "Adding…" : "Add requirement"}
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
          items={available}
          renderItem={(s) => (
            <SkillSelectorRow
              key={s.id}
              skill={s}
              selected={picked === Number(s.id)}
              onToggle={() => select(Number(s.id))}
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
        <FieldDescription>Skills already required by this project are hidden</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>
          Required level <span className="text-destructive-foreground">*</span>
        </FieldLabel>
        <SkillLevelPicker value={level} onChange={setLevel} disabled={adding} />
        <FieldDescription>Target proficiency the team must reach (1 = beginner, 5 = expert)</FieldDescription>
      </Field>
    </ComposedSheet>
  );
}
