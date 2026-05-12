import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useCreateSkillCategory from "@/api/skill-categories/useCreateSkillCategory";
import { cn } from "@/lib/utils";

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
      .test("unique", "A category with this name already exists.", (val) =>
        !categoriesRef.current.some((c) => c.name === (val ?? "").trim().toUpperCase()),
      ),
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const { mutate: createCategory, isPending } = useCreateSkillCategory();

  const watchedName = watch("name");
  const normalizedName = watchedName.trim().toUpperCase();

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name }: FormValues) {
    createCategory({ name: name.trim().toUpperCase() }, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => { if (!v) handleClose(); }}
      title="Add Category"
      description="Categories group skills and define radar chart axes"
      icon={<Layers className="size-4 text-primary" />}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} className="flex-1 rounded-xl" disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid || isPending}
            className="flex-1 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? "Adding…" : "Add Category"}
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
              <FieldLabel>Category Name</FieldLabel>
              <Input
                {...field}
                placeholder="e.g. MOBILE, DATA SCIENCE"
                autoFocus
                autoComplete="off"
                maxLength={MAX_NAME_LENGTH + 1}
                aria-invalid={!!errors.name}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
          <Field>
            <FieldLabel>Existing categories</FieldLabel>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
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
          </Field>
        )}
      </div>
    </ComposedSheet>
  );
}
