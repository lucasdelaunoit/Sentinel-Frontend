import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";
import SkillLevelPicker from "@/components/specified/models/skill/items/SkillLevelPicker";
import useUpdateUserSkillLevel from "@/api/user/useUpdateUserSkillLevel";

interface EditUserSkillLevelSheetProps {
  userId: string;
  skill: UserSkillDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserSkillLevelSheet({ userId, skill, open, onOpenChange }: EditUserSkillLevelSheetProps) {
  const [level, setLevel] = useState<number>(skill.pivot.level);
  const { updateUserSkillLevel, isLoading } = useUpdateUserSkillLevel();

  useEffect(() => {
    if (open) setLevel(skill.pivot.level);
  }, [open, skill.pivot.level]);

  const dirty = level !== skill.pivot.level;

  function close() {
    onOpenChange(false);
  }

  async function submit() {
    if (!dirty) return;
    try {
      await updateUserSkillLevel({ userId, skillId: skill.id, level });
      toast.success("Skill level updated.");
      close();
    } catch {
      /* hook toasts */
    }
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) close();
      }}
      title="Edit skill level"
      description="Adjust this employee's proficiency"
      maxWidth="sm:max-w-[480px]"
      footer={
        <>
          <Button variant="outline" onClick={close} className="flex-1" disabled={isLoading} size="lg">
            Cancel
          </Button>
          <Button onClick={submit} disabled={!dirty} loading={isLoading} className="flex-1" size="lg">
            {isLoading ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
        <p className="text-[14px] font-semibold text-foreground">{skill.name}</p>
        {skill.category && <SkillCategoryBadge category={skill.category} className="mt-1.5 bg-muted/60" />}
      </div>

      <Field>
        <FieldLabel>
          Proficiency level <span className="text-destructive-foreground">*</span>
        </FieldLabel>
        <SkillLevelPicker value={level} onChange={setLevel} disabled={isLoading} />
        <FieldDescription>From beginner (1) to expert (5)</FieldDescription>
      </Field>
    </ComposedSheet>
  );
}
