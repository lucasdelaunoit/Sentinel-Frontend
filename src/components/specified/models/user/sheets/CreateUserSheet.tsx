import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field.tsx";
import ComposedSheet from "@/components/common/sheets/ComposedSheet.tsx";
import SkillsPicker from "@/components/specified/models/skill/form/SkillsPicker.tsx";
import DepartmentPicker from "@/components/specified/models/department/form/DepartmentPicker.tsx";
import useGetDepartments from "@/api/department/useGetDepartments.ts";
import useGetSkills from "@/api/skill/useGetSkills.ts";
import useCreateUser from "@/api/user/useCreateUser.ts";
import useAttachSkillToUser from "@/api/user/useAttachSkillToUser.ts";

const MAX_NAME = 80;
const MAX_EMAIL = 180;
const MAX_TITLE = 120;

interface UserSkillForm {
  skill_id: number;
  level: number;
}

interface FormValues {
  firstname: string;
  lastname: string;
  email: string;
  title: string;
  department_id: number | null;
  skills: UserSkillForm[];
}

interface CreateUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  skills: yup
    .array()
    .of(
      yup.object({
        skill_id: yup.number().required(),
        level: yup.number().min(1).max(5).required(),
      }),
    )
    .default([]),
});

const DEFAULT_VALUES: FormValues = {
  firstname: "",
  lastname: "",
  email: "",
  title: "",
  department_id: null,
  skills: [],
};

export default function CreateUserSheet({ open, onOpenChange }: CreateUserSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const [skillSearch, setSkillSearch] = useState("");

  useEffect(() => {
    if (open) {
      reset(DEFAULT_VALUES);
      setSkillSearch("");
    }
  }, [open, reset]);

  const { createUser, isLoading: isCreating } = useCreateUser();
  const { attachSkillToUser, isLoading: isAttaching } = useAttachSkillToUser();
  const isPending = isCreating || isAttaching;

  const { data: departments, isLoading: deptsLoading } = useGetDepartments({
    per_page: 100,
    sorts: [{ field: "name", direction: "asc" }],
  });
  const { data: skills, isLoading: skillsLoading } = useGetSkills({
    per_page: 50,
    search: skillSearch || undefined,
  });

  const departmentId = watch("department_id");
  const userSkills = watch("skills");

  function toggleSkill(id: number) {
    if (userSkills.some((s) => s.skill_id === id)) {
      setValue(
        "skills",
        userSkills.filter((s) => s.skill_id !== id),
        { shouldDirty: true, shouldValidate: true },
      );
    } else {
      setValue("skills", [...userSkills, { skill_id: id, level: 3 }], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function setSkillLevel(id: number, level: number) {
    setValue(
      "skills",
      userSkills.map((s) => (s.skill_id === id ? { ...s, level } : s)),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function handleClose() {
    reset(DEFAULT_VALUES);
    setSkillSearch("");
    onOpenChange(false);
  }

  async function onSubmit(v: FormValues) {
    const payload: CreateUserRequest = {
      firstname: v.firstname.trim(),
      lastname: v.lastname.trim(),
      email: v.email.trim(),
      ...(v.title.trim() && { title: v.title.trim() }),
      ...(v.department_id != null && { department_id: v.department_id }),
    };

    try {
      const created = await createUser(payload);
      if (v.skills.length > 0 && created?.id != null) {
        await Promise.all(
          v.skills.map((s) => attachSkillToUser({ userId: created.id, skillId: s.skill_id, level: s.level })),
        );
      }
      handleClose();
    } catch {
      /* toast already surfaced inside the hook */
    }
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="New Employee"
      description="Add a teammate to the organization"
      maxWidth="sm:max-w-[560px]"
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
            {isPending ? "Creating…" : "Create employee"}
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

        <SkillsPicker
          label="Skills"
          description="Pick skills and set proficiency (1 = beginner, 5 = expert)"
          skills={skills}
          isLoading={skillsLoading}
          search={skillSearch}
          onSearchChange={setSkillSearch}
          selected={userSkills.map((s) => ({ skillId: s.skill_id, level: s.level }))}
          onToggle={toggleSkill}
          onLevelChange={setSkillLevel}
        />
      </div>
    </ComposedSheet>
  );
}
