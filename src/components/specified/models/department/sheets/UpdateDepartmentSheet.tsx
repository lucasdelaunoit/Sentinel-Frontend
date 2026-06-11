import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useUpdateDepartment from "@/api/department/useUpdateDepartment";

const MAX_NAME_LENGTH = 64;

interface FormValues {
  name: string;
}

interface UpdateDepartmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department;
}

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
});

export default function UpdateDepartmentSheet({ open, onOpenChange, department }: UpdateDepartmentSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: department.name },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset({ name: department.name });
  }, [open, department, reset]);

  const { updateDepartment, isLoading: isPending } = useUpdateDepartment();

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name }: FormValues) {
    updateDepartment({ id: department.id, name: name.trim() }, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Edit Department"
      description="Rename this department"
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
