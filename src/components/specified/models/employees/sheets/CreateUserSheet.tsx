import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { UserPlusIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SelectorList from "@/components/common/inputs/SelectorList";
import LevelPicker from "@/components/common/inputs/LevelPicker";
import SkillSelectorRow from "@/components/specified/models/skill/items/SkillSelectorRow";
import useGetDepartments from "@/api/departments/useGetDepartments";
import useGetSkills from "@/api/skills/useGetSkills";
import useCreateUser from "@/api/users/useCreateUser";
import useAttachSkillToUser from "@/api/users/useAttachSkillToUser";
import { cn } from "@/lib/utils";

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

  const selectedSkillsMap = useMemo(() => {
    const map = new Map<number, UserSkillForm>();
    userSkills.forEach((s) => map.set(s.skill_id, s));
    return map;
  }, [userSkills]);

  function toggleSkill(id: number) {
    if (selectedSkillsMap.has(id)) {
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
          v.skills.map((s) =>
            attachSkillToUser({ userId: created.id, skillId: s.skill_id, level: s.level }),
          ),
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
      icon={<UserPlusIcon className="size-4 text-primary" />}
      maxWidth="sm:max-w-[560px]"
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

        {/* Department */}
        <Field>
          <div className="flex items-center justify-between mb-1">
            <FieldLabel>Department</FieldLabel>
            {departmentId != null && (
              <button
                type="button"
                onClick={() => setValue("department_id", null, { shouldDirty: true, shouldValidate: true })}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {deptsLoading ? (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          ) : departments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-[12px] text-muted-foreground">
              No departments yet. Create one in Settings.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {departments.map((d) => {
                const active = departmentId === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      setValue("department_id", active ? null : d.id, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                      active
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 bg-card text-foreground/70 hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    {d.name}
                    {typeof d.users_count === "number" && (
                      <span
                        className={cn(
                          "text-[10px] tabular-nums",
                          active ? "text-primary/70" : "text-muted-foreground/70",
                        )}
                      >
                        {d.users_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <FieldDescription>Optional — used to group employees and target rules</FieldDescription>
        </Field>

        {/* Skills */}
        <Field>
          <div className="flex items-center justify-between mb-1">
            <FieldLabel>Skills</FieldLabel>
            <span className="text-[11px] text-muted-foreground tabular-nums">{userSkills.length} added</span>
          </div>
          <SelectorList
            items={skills}
            renderItem={(s) => (
              <SkillSelectorRow
                key={s.id}
                skill={s}
                selected={selectedSkillsMap.has(Number(s.id))}
                onToggle={() => toggleSkill(Number(s.id))}
                searchTerm={skillSearch}
              />
            )}
            renderSkeleton={() => <SkillSelectorRow.Skeleton />}
            searchValue={skillSearch}
            onSearchChange={setSkillSearch}
            searchPlaceholder="Search skills..."
            isLoading={skillsLoading}
            emptyMessage="No skills found."
            maxHeight="max-h-64"
            selected={
              userSkills.length > 0 && (
                <div className="space-y-2">
                  {userSkills.map((s) => {
                    const skill = skills.find((sk) => Number(sk.id) === s.skill_id);
                    return (
                      <div
                        key={s.skill_id}
                        className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card px-3 py-2.5"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground truncate leading-tight">
                            {skill?.name ?? `Skill #${s.skill_id}`}
                          </p>
                          {skill?.category?.name && (
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{skill.category.name}</p>
                          )}
                        </div>
                        <LevelPicker value={s.level} onChange={(lvl) => setSkillLevel(s.skill_id, lvl)} />
                        <button
                          type="button"
                          onClick={() => toggleSkill(s.skill_id)}
                          className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            }
          />
          <FieldDescription>Pick skills and set proficiency (1 = beginner, 5 = expert)</FieldDescription>
        </Field>
      </div>
    </ComposedSheet>
  );
}
