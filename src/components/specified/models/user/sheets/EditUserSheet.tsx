import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field.tsx";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import DepartmentPicker from "@/components/specified/models/department/form/DepartmentPicker.tsx";
import useUpdateUser from "@/api/user/useUpdateUser.ts";
import useGetDepartments from "@/api/department/useGetDepartments.ts";

const MAX_NAME = 80;
const MAX_EMAIL = 180;
const MAX_TITLE = 120;

interface FormValues {
  firstname: string;
  lastname: string;
  email: string;
  title: string;
  department_id: number | null;
}

interface EditUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

const schema = yup.object({
  firstname: yup
    .string()
    .required("First name is required.")
    .min(2, "First name must be at least 2 characters.")
    .max(MAX_NAME, `First name must be ${MAX_NAME} characters or fewer.`),
  lastname: yup
    .string()
    .required("Last name is required.")
    .min(2, "Last name must be at least 2 characters.")
    .max(MAX_NAME, `Last name must be ${MAX_NAME} characters or fewer.`),
  email: yup
    .string()
    .required("Email is required.")
    .email("Enter a valid email address.")
    .max(MAX_EMAIL, `Email must be ${MAX_EMAIL} characters or fewer.`),
  title: yup.string().default("").max(MAX_TITLE, `Title must be ${MAX_TITLE} characters or fewer.`),
  department_id: yup.number().nullable().default(null),
});

function fromUser(user: User): FormValues {
  return {
    firstname: user.firstname ?? "",
    lastname: user.lastname ?? "",
    email: user.email ?? "",
    title: user.title ?? "",
    department_id: user.department?.id ?? null,
  };
}

export default function EditUserSheet({ open, onOpenChange, user }: EditUserSheetProps) {
  const { updateUser, isLoading } = useUpdateUser();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: fromUser(user),
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset(fromUser(user));
  }, [open, user, reset]);

  const { data: departments, isLoading: deptsLoading } = useGetDepartments({
    per_page: 100,
    sorts: [{ field: "name", direction: "asc" }],
  });

  const departmentId = watch("department_id");

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  async function onSubmit(v: FormValues) {
    // Send only changed fields. Reduces 422 risk on email-unique check when unchanged.
    const initial = fromUser(user);
    const payload: UpdateUserRequest = {};
    if (v.firstname.trim() !== initial.firstname) payload.firstname = v.firstname.trim();
    if (v.lastname.trim() !== initial.lastname) payload.lastname = v.lastname.trim();
    if (v.email.trim() !== initial.email) payload.email = v.email.trim();
    if (v.title.trim() !== (initial.title ?? "")) payload.title = v.title.trim() || null;
    if (v.department_id !== initial.department_id) payload.department_id = v.department_id;

    if (Object.keys(payload).length === 0) {
      handleClose();
      return;
    }

    try {
      await updateUser({ id: user.id, payload });
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
      title="Edit Profile"
      description="Update employee identity, contact, and department"
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
        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="firstname"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  First name <span className="text-destructive-foreground">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g. Ada"
                  autoFocus
                  autoComplete="off"
                  maxLength={MAX_NAME + 1}
                  aria-invalid={!!errors.firstname}
                />
                {errors.firstname && <FieldError>{errors.firstname.message}</FieldError>}
              </Field>
            )}
          />
          <Controller
            name="lastname"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Last name <span className="text-destructive-foreground">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g. Lovelace"
                  autoComplete="off"
                  maxLength={MAX_NAME + 1}
                  aria-invalid={!!errors.lastname}
                />
                {errors.lastname && <FieldError>{errors.lastname.message}</FieldError>}
              </Field>
            )}
          />
        </div>

        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Work email <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Input
                {...field}
                type="email"
                placeholder="ada@company.com"
                autoComplete="off"
                maxLength={MAX_EMAIL + 1}
                aria-invalid={!!errors.email}
              />
              {errors.email ? (
                <FieldError>{errors.email.message}</FieldError>
              ) : (
                <FieldDescription>Used for sign-in and notifications</FieldDescription>
              )}
            </Field>
          )}
        />

        {/* Title */}
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input
                {...field}
                placeholder="e.g. Senior Backend Engineer"
                autoComplete="off"
                maxLength={MAX_TITLE + 1}
                aria-invalid={!!errors.title}
              />
              {errors.title && <FieldError>{errors.title.message}</FieldError>}
            </Field>
          )}
        />

        <DepartmentPicker
          departments={departments}
          isLoading={deptsLoading}
          value={departmentId}
          onChange={(id) => setValue("department_id", id, { shouldDirty: true, shouldValidate: true })}
        />
      </div>
    </ComposedSheet>
  );
}
