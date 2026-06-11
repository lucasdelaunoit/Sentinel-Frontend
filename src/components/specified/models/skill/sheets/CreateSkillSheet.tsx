import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";
import useCreateSkill from "@/api/skill/useCreateSkill";
import { cn } from "@/lib/utils";

const MAX_NAME_LENGTH = 48;

interface FormValues {
  name: string;
  skill_category_id: number | "";
}

interface CreateSkillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SkillCategory[];
  presetCategory?: SkillCategory;
}

export default function CreateSkillSheet({ open, onOpenChange, categories, presetCategory }: CreateSkillSheetProps) {
  const schema = yup.object({
    name: yup
      .string()
      .required("Name is required.")
      .min(2, "Name must be at least 2 characters.")
      .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
    skill_category_id: presetCategory
      ? yup.mixed<number | "">().notRequired()
      : yup.number().typeError("Category is required.").required("Category is required."),
  });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: { name: "", skill_category_id: presetCategory?.id ?? categories[0]?.id ?? "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({ name: "", skill_category_id: presetCategory?.id ?? categories[0]?.id ?? "" });
    }
  }, [open, presetCategory, categories, reset]);

  const { createSkill, isLoading: isPending } = useCreateSkill();
  const selectedCategoryId = watch("skill_category_id");

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name, skill_category_id }: FormValues) {
    const targetId = presetCategory?.id ?? (skill_category_id as number);
    if (!targetId) return;
    createSkill({ name: name.trim(), skill_category_id: targetId }, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Add Skill"
      description="Define a new skill for the organizational catalog"
      icon={<Sparkles className="size-4 text-primary" />}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isPending} size="lg">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid || isPending}
            className="flex-1"
            size="lg"
          >
            {isPending ? "Adding…" : "Create the skill"}
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

        {presetCategory ? (
          <Field>
            <FieldLabel>
              Category <span className="text-destructive-foreground">*</span>
            </FieldLabel>
            <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
              <SkillCategoryBadge category={presetCategory} className="bg-secondary" />
              <span className="text-[11px] text-muted-foreground">Preselected from current filter</span>
            </div>
          </Field>
        ) : (
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
                        onClick={() =>
                          setValue("skill_category_id", cat.id, { shouldDirty: true, shouldValidate: true })
                        }
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
        )}
      </div>
    </ComposedSheet>
  );
}
