import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FolderPlusIcon, XIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import SearchBar from "@/components/common/inputs/SearchBar";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar";
import useGetUsers from "@/api/users/useGetUsers";
import useGetSkills from "@/api/skills/useGetSkills";
import useCreateProject from "@/api/projects/useCreateProject";
import { cn } from "@/lib/utils";

const MAX_NAME = 80;
const MAX_DESC = 5000;
const LEVELS = [1, 2, 3, 4, 5] as const;

interface SkillReqForm {
  skill_id: number;
  required_level: number;
}

interface FormValues {
  name: string;
  description: string;
  started_at: string;
  deadline: string;
  user_ids: number[];
  skill_requirements: SkillReqForm[];
}

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required.")
    .min(2, "Name must be at least 2 characters.")
    .max(MAX_NAME, `Name must be ${MAX_NAME} characters or fewer.`),
  description: yup.string().max(MAX_DESC, `Description must be ${MAX_DESC} characters or fewer.`).default(""),
  started_at: yup.string().default(""),
  deadline: yup
    .string()
    .default("")
    .test("after-start", "Deadline must be on or after start date.", function (value) {
      const { started_at } = this.parent;
      if (!started_at || !value) return true;
      return new Date(value) >= new Date(started_at);
    }),
  user_ids: yup.array().of(yup.number().required()).default([]),
  skill_requirements: yup
    .array()
    .of(
      yup.object({
        skill_id: yup.number().required(),
        required_level: yup.number().min(1).max(5).required(),
      }),
    )
    .default([]),
});

function initials(u: UserListItem) {
  return `${u.firstname?.[0] ?? ""}${u.lastname?.[0] ?? ""}`.toUpperCase();
}

export default function CreateProjectSheet({ open, onOpenChange }: CreateProjectSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      name: "",
      description: "",
      started_at: "",
      deadline: "",
      user_ids: [],
      skill_requirements: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        description: "",
        started_at: "",
        deadline: "",
        user_ids: [],
        skill_requirements: [],
      });
    }
  }, [open, reset]);

  const { mutate: createProject, isPending } = useCreateProject();

  const userIds = watch("user_ids");
  const skillReqs = watch("skill_requirements");

  const [userSearch, setUserSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  const { data: usersData, isLoading: usersLoading } = useGetUsers(
    { per_page: 50, search: userSearch || undefined },
    open,
  );
  const { data: skillsData, isLoading: skillsLoading } = useGetSkills({
    per_page: 50,
    search: skillSearch || undefined,
  });

  const users = usersData?.data ?? [];
  const skills = skillsData?.data ?? [];

  const selectedUsers = useMemo(
    () => users.filter((u) => userIds.includes(Number(u.id))),
    [users, userIds],
  );

  const selectedSkillsMap = useMemo(() => {
    const map = new Map<number, SkillReqForm>();
    skillReqs.forEach((r) => map.set(r.skill_id, r));
    return map;
  }, [skillReqs]);

  function toggleUser(id: number) {
    const next = userIds.includes(id) ? userIds.filter((x) => x !== id) : [...userIds, id];
    setValue("user_ids", next, { shouldDirty: true, shouldValidate: true });
  }

  function toggleSkill(id: number) {
    if (selectedSkillsMap.has(id)) {
      setValue(
        "skill_requirements",
        skillReqs.filter((r) => r.skill_id !== id),
        { shouldDirty: true, shouldValidate: true },
      );
    } else {
      setValue(
        "skill_requirements",
        [...skillReqs, { skill_id: id, required_level: 3 }],
        { shouldDirty: true, shouldValidate: true },
      );
    }
  }

  function setSkillLevel(id: number, level: number) {
    setValue(
      "skill_requirements",
      skillReqs.map((r) => (r.skill_id === id ? { ...r, required_level: level } : r)),
      { shouldDirty: true, shouldValidate: true },
    );
  }

  function handleClose() {
    reset();
    setUserSearch("");
    setSkillSearch("");
    onOpenChange(false);
  }

  function onSubmit(v: FormValues) {
    const payload: CreateProjectRequest = {
      name: v.name.trim(),
      ...(v.description.trim() && { description: v.description.trim() }),
      ...(v.started_at && { started_at: v.started_at }),
      ...(v.deadline && { deadline: v.deadline }),
      ...(v.user_ids.length > 0 && { user_ids: v.user_ids }),
      ...(v.skill_requirements.length > 0 && { skill_requirements: v.skill_requirements }),
    };
    createProject(payload, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="New Project"
      description="Create a project and assign team + required skills"
      icon={<FolderPlusIcon className="size-4 text-primary" />}
      maxWidth="sm:max-w-[520px]"
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
            {isPending ? "Creating…" : "Create project"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Name */}
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

        {/* Description */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Description</FieldLabel>
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

        {/* Dates */}
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

        {/* Team members */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Team members</FieldLabel>
            <span className="text-[11px] text-muted-foreground tabular-nums">{userIds.length} selected</span>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 pb-2">
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary pl-1 pr-2 py-0.5 text-[11px] font-medium"
                >
                  <span className="size-5 rounded-full bg-primary/20 grid place-items-center text-[9px] font-bold">
                    {initials(u)}
                  </span>
                  {u.firstname} {u.lastname}
                  <button
                    type="button"
                    onClick={() => toggleUser(Number(u.id))}
                    className="hover:text-foreground cursor-pointer"
                  >
                    <XIcon className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <SearchBar value={userSearch} onChange={setUserSearch} placeholder="Search employees..." size="sm" />

          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/40">
            {usersLoading ? (
              <div className="p-3 text-[12px] text-muted-foreground">Loading…</div>
            ) : users.length === 0 ? (
              <div className="p-3 text-[12px] text-muted-foreground">No employees found.</div>
            ) : (
              users.map((u) => {
                const id = Number(u.id);
                const checked = userIds.includes(id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer transition-colors",
                      checked ? "bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    <Checkbox checked={checked} className="pointer-events-none" />
                    <UserAvatar initials={initials(u)} size="base" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold text-foreground truncate">
                        {u.firstname} {u.lastname}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {u.title} · {u.department?.name}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <FieldDescription>Pick employees to assign to this project</FieldDescription>
        </Field>

        {/* Skill requirements */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel>Required skills</FieldLabel>
            <span className="text-[11px] text-muted-foreground tabular-nums">{skillReqs.length} added</span>
          </div>

          {skillReqs.length > 0 && (
            <div className="space-y-1.5 pt-1 pb-2">
              {skillReqs.map((req) => {
                const skill = skills.find((s) => Number(s.id) === req.skill_id);
                return (
                  <div
                    key={req.skill_id}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2.5 py-1.5"
                  >
                    <span className="flex-1 text-[12.5px] font-semibold text-foreground truncate">
                      {skill?.name ?? `Skill #${req.skill_id}`}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {LEVELS.map((lvl) => {
                        const active = req.required_level === lvl;
                        return (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSkillLevel(req.skill_id, lvl)}
                            className={cn(
                              "size-6 rounded-md text-[11px] font-bold tabular-nums transition-colors cursor-pointer",
                              active
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-muted/60 text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {lvl}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSkill(req.skill_id)}
                      className="size-6 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <SearchBar value={skillSearch} onChange={setSkillSearch} placeholder="Search skills..." size="sm" />

          <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/40">
            {skillsLoading ? (
              <div className="p-3 text-[12px] text-muted-foreground">Loading…</div>
            ) : skills.length === 0 ? (
              <div className="p-3 text-[12px] text-muted-foreground">No skills found.</div>
            ) : (
              skills.map((s) => {
                const id = Number(s.id);
                const added = selectedSkillsMap.has(id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSkill(id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-left cursor-pointer transition-colors",
                      added ? "bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    <div
                      className={cn(
                        "size-5 rounded-md grid place-items-center transition-colors",
                        added ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground",
                      )}
                    >
                      <PlusIcon className="size-3" weight="bold" />
                    </div>
                    <span className="flex-1 text-[12.5px] font-semibold text-foreground truncate">{s.name}</span>
                    <span className="text-[11px] text-muted-foreground">{s.category?.name}</span>
                  </button>
                );
              })
            )}
          </div>
          <FieldDescription>Each requirement defines a target level (1 = beginner, 5 = expert)</FieldDescription>
        </Field>
      </div>
    </ComposedSheet>
  );
}
