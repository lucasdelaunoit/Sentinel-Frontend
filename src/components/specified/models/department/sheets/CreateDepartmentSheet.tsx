import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { BuildingsIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useCreateDepartment from "@/api/departments/useCreateDepartment";

const MAX_NAME_LENGTH = 64;

interface FormValues {
  name: string;
}

interface CreateDepartmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
});

export default function CreateDepartmentSheet({ open, onOpenChange }: CreateDepartmentSheetProps) {
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

  useEffect(() => {
    if (open) reset({ name: "" });
  }, [open, reset]);

  const { createDepartment, isLoading: isPending } = useCreateDepartment();

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name }: FormValues) {
    createDepartment({ name: name.trim() }, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Add Department"
      description="Create a new department to group employees"
      icon={<BuildingsIcon className="size-4 text-primary" />}
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
            {isPending ? "Adding…" : "Create the department"}
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
                Department Name <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Input
                {...field}
                placeholder="e.g. Engineering, Operations, Sales"
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
                <FieldDescription>Will be available when assigning employees</FieldDescription>
              )}
            </Field>
          )}
        />
      </div>
    </ComposedSheet>
  );
}
