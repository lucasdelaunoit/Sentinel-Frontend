import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field.tsx";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import useUpdateProject from "@/api/projects/useUpdateProject.ts";

const MAX_NAME = 80;
const MAX_DESC = 5000;

interface FormValues {
  name: string;
  description: string;
  started_at: string;
  deadline: string;
}

interface EditProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectDetailResponse;
}

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(MAX_NAME, `Name must be ${MAX_NAME} characters or fewer.`),
  description: yup
    .string()
    .required("Description is required.")
    .min(2, "Description must be at least 2 characters.")
    .max(MAX_DESC, `Description must be ${MAX_DESC} characters or fewer.`),
  started_at: yup.string().default(""),
  deadline: yup
    .string()
    .default("")
    .test("after-start", "Deadline must be on or after start date.", function (value) {
      const { started_at } = this.parent;
      if (!started_at || !value) return true;
      return new Date(value) >= new Date(started_at);
    }),
});

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export default function EditProjectSheet({ open, onOpenChange, project }: EditProjectSheetProps) {
  const { updateProject, isLoading } = useUpdateProject();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      name: project.name,
      description: project.description,
      started_at: toDateInput(project.started_at),
      deadline: toDateInput(project.deadline),
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        description: project.description,
        started_at: toDateInput(project.started_at),
        deadline: toDateInput(project.deadline),
      });
    }
  }, [open, project, reset]);

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  async function onSubmit(v: FormValues) {
    const payload: UpdateProjectRequest = {
      name: v.name.trim(),
      description: v.description.trim(),
      started_at: v.started_at || undefined,
      deadline: v.deadline || undefined,
    };
    try {
      await updateProject({ id: project.id, payload });
      handleClose();
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Edit Project"
      description="Update project name, description, and dates"
      icon={<PencilSimpleIcon className="size-4 text-primary" />}
      maxWidth="sm:max-w-[560px]"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isLoading} size="lg">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isDirty || !isValid || isLoading}
            className="flex-1"
            size="lg"
          >
            {isLoading ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Project Name <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Input
                {...field}
                placeholder="e.g. API Modernization"
                autoFocus
                autoComplete="off"
                maxLength={MAX_NAME + 1}
                aria-invalid={!!errors.name}
              />
              {errors.name ? (
                <FieldError>{errors.name.message}</FieldError>
              ) : (
                <FieldDescription>Visible across the dashboard and reports</FieldDescription>
              )}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Description <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Textarea
                {...field}
                rows={3}
                placeholder="Brief context, goals, scope…"
                maxLength={MAX_DESC + 1}
                aria-invalid={!!errors.description}
              />
              {errors.description && <FieldError>{errors.description.message}</FieldError>}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="started_at"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Start date</FieldLabel>
                <Input {...field} type="date" aria-invalid={!!errors.started_at} />
                {errors.started_at && <FieldError>{errors.started_at.message}</FieldError>}
              </Field>
            )}
          />
          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Deadline</FieldLabel>
                <Input {...field} type="date" aria-invalid={!!errors.deadline} />
                {errors.deadline && <FieldError>{errors.deadline.message}</FieldError>}
              </Field>
            )}
          />
        </div>
      </div>
    </ComposedSheet>
  );
}
