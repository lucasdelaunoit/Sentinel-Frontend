import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";
import useUpdateSkill from "@/api/skill/useUpdateSkill";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 48;

interface FormValues {
  name: string;
  skill_category_id: number | "";
}

interface UpdateSkillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: Skill;
  categories: SkillCategory[];
}

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
  skill_category_id: yup.number().typeError("Category is required.").required("Category is required."),
});

export default function UpdateSkillSheet({ open, onOpenChange, skill, categories }: UpdateSkillSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: { name: skill.name, skill_category_id: skill.category.id },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({ name: skill.name, skill_category_id: skill.category.id });
    }
  }, [open, skill, reset]);

  const { updateSkill, isLoading: isPending } = useUpdateSkill();
  const selectedCategoryId = watch("skill_category_id");

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name, skill_category_id }: FormValues) {
    if (!skill_category_id) return;
    updateSkill(
      { id: skill.id, name: name.trim(), skill_category_id: skill_category_id as number },
      { onSuccess: handleClose },
    );
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Edit Skill"
      description="Update skill name or category"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isPending} size="lg">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid}
            loading={isPending}
            className="flex-1"
            size="lg"
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Skill Name <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Input
                {...field}
                placeholder="e.g. React, AWS, PostgreSQL"
                autoFocus
                autoComplete="off"
                maxLength={MAX_NAME_LENGTH + 1}
                aria-invalid={!!errors.name}
                onChange={(e) => field.onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit(onSubmit)()}
              />
              {errors.name ? (
                <FieldError>{errors.name.message}</FieldError>
              ) : (
                <FieldDescription>Will appear in the skill catalog</FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          name="skill_category_id"
          control={control}
          render={() => (
            <Field>
              <FieldLabel>
                Category <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {categories.map((cat) => {
                  const active = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setValue("skill_category_id", cat.id, { shouldDirty: true, shouldValidate: true })}
                      className={cn(
                        "rounded-md transition-opacity cursor-pointer",
                        !active && "opacity-50 hover:opacity-100",
                      )}
                    >
                      <SkillCategoryBadge
                        category={cat}
                        className={cn(active ? "bg-primary/15 text-primary" : "bg-secondary")}
                      />
                    </button>
                  );
                })}
              </div>
              {errors.skill_category_id ? (
                <FieldError>{errors.skill_category_id.message as string}</FieldError>
              ) : (
                <FieldDescription>Pick which category this skill belongs to</FieldDescription>
              )}
            </Field>
          )}
        />
      </div>
    </ComposedSheet>
  );
}
