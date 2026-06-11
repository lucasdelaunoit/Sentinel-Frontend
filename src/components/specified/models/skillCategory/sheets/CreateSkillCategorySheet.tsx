import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useCreateSkillCategory from "@/api/skillCategory/useCreateSkillCategory";
import SkillCategoryBadge from "@/components/specified/models/skill/badges/SkillCategoryBadge.tsx";

const MAX_NAME_LENGTH = 32;

interface FormValues {
  name: string;
}

interface CreateSkillCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SkillCategory[];
  maxCategories: number;
}

export default function CreateSkillCategorySheet({
  open,
  onOpenChange,
  categories,
  maxCategories,
}: CreateSkillCategorySheetProps) {
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const schema = yup.object({
    name: yup
      .string()
      .required("Name is required.")
      .min(2, "Name must be at least 2 characters.")
      .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`)
      .test(
        "unique",
        "A category with this name already exists.",
        (val) => !categoriesRef.current.some((c) => c.name === (val ?? "").trim().toUpperCase()),
      ),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const { createSkillCategory: createCategory, isLoading: isPending } = useCreateSkillCategory();

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name }: FormValues) {
    createCategory({ name: name }, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Add Category"
      description="Categories group skills and define radar chart axes"
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
            {isPending ? "Adding…" : "Create the category"}
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
                Category Name <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Input
                {...field}
                placeholder="e.g. Mobile, Data, ..."
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
                <FieldDescription>Will appear as a radar chart axis</FieldDescription>
              )}
            </Field>
          )}
        />

        {categories.length > 0 && (
          <Field>
            <FieldLabel>
              Existing categories ({categories.length}/{maxCategories})
            </FieldLabel>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {categories.map((cat) => (
                <SkillCategoryBadge category={cat} className="bg-secondary" />
              ))}
            </div>
          </Field>
        )}
      </div>
    </ComposedSheet>
  );
}
