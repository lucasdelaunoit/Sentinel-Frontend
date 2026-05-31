import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useUpdateAbsence from "@/api/absences/useUpdateAbsence";
import { cn } from "@/lib/utils";
import { ABSENCE_TYPE_LABEL, ABSENCE_TYPE_VALUES } from "@/utils/absence/absenceType.ts";

interface FormValues {
  type: AbsenceType;
  start_date: string;
  end_date: string;
  reason: string;
}

interface EditAbsenceSheetProps {
  absence: Absence;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_STYLE: Record<AbsenceType, { idle: string; active: string }> = {
  vacation: { idle: "border-blue-200 bg-blue-50/60", active: "bg-blue-600 border-blue-600 text-white" },
  conference: {
    idle: "border-violet-200 bg-violet-50/60",
    active: "bg-violet-600 border-violet-600 text-white",
  },
  training: {
    idle: "border-amber-200 bg-amber-50/60",
    active: "bg-amber-600 border-amber-600 text-white",
  },
  parental: {
    idle: "border-emerald-200 bg-emerald-50/60",
    active: "bg-emerald-600 border-emerald-600 text-white",
  },
  sabbatical: {
    idle: "border-indigo-200 bg-indigo-50/60",
    active: "bg-indigo-600 border-indigo-600 text-white",
  },
  other: { idle: "border-slate-200 bg-slate-50/60", active: "bg-slate-600 border-slate-600 text-white" },
};

const schema = yup.object({
  type: yup.string().oneOf(ABSENCE_TYPE_VALUES).required("Type is required."),
  start_date: yup.string().required("Start date is required."),
  end_date: yup
    .string()
    .required("End date is required.")
    .test("end-after-start", "End date must be on or after start date.", function (value) {
      const { start_date } = this.parent;
      if (!start_date || !value) return true;
      return new Date(value) >= new Date(start_date);
    }),
  reason: yup.string().max(255, "Reason must be 255 characters or fewer.").optional().default(""),
});

function defaults(absence: Absence): FormValues {
  return {
    type: absence.type ?? ("vacation" as AbsenceType),
    start_date: absence.start_date,
    end_date: absence.end_date,
    reason: absence.reason ?? "",
  };
}

export default function EditAbsenceSheet({ absence, userId, open, onOpenChange }: EditAbsenceSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: defaults(absence),
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset(defaults(absence));
  }, [open, absence, reset]);

  const { updateAbsence, isLoading: isPending } = useUpdateAbsence();
  const selectedType = watch("type");

  function handleClose() {
    onOpenChange(false);
  }

  async function onSubmit({ type, start_date, end_date, reason }: FormValues) {
    try {
      await updateAbsence({
        id: absence.id,
        userId,
        type,
        start_date,
        end_date,
        reason: reason || null,
      });
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
      title="Edit absence"
      description="Update this absence record"
      icon={<CalendarBlankIcon className="size-4 text-primary" />}
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
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Controller
          name="type"
          control={control}
          render={() => (
            <Field>
              <FieldLabel>
                Type <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {ABSENCE_TYPE_VALUES.map((value) => {
                  const active = selectedType === value;
                  const style = TYPE_STYLE[value];
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setValue("type", value, { shouldDirty: true, shouldValidate: true })}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2.5 text-[12px] font-semibold transition-all duration-150",
                        active ? style.active : `${style.idle} text-foreground hover:opacity-80`,
                      )}
                    >
                      {ABSENCE_TYPE_LABEL[value]}
                    </button>
                  );
                })}
              </div>
              {errors.type && <FieldError>{errors.type.message}</FieldError>}
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  Start date <span className="text-destructive-foreground">*</span>
                </FieldLabel>
                <Input {...field} type="date" aria-invalid={!!errors.start_date} />
                {errors.start_date && <FieldError>{errors.start_date.message}</FieldError>}
              </Field>
            )}
          />
          <Controller
            name="end_date"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>
                  End date <span className="text-destructive-foreground">*</span>
                </FieldLabel>
                <Input {...field} type="date" aria-invalid={!!errors.end_date} />
                {errors.end_date && <FieldError>{errors.end_date.message}</FieldError>}
              </Field>
            )}
          />
        </div>

        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Reason</FieldLabel>
              <textarea
                {...field}
                rows={3}
                placeholder="Optional — e.g. Annual leave, doctor appointment…"
                maxLength={256}
                className="w-full rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all resize-none"
              />
              {errors.reason ? (
                <FieldError>{errors.reason.message}</FieldError>
              ) : (
                <FieldDescription>Optional context for this absence</FieldDescription>
              )}
            </Field>
          )}
        />
      </div>
    </ComposedSheet>
  );
}
