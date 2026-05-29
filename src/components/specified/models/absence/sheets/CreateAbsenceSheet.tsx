import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useCreateAbsence from "@/api/absences/useCreateAbsence";
import { cn } from "@/lib/utils";
import type { AbsenceType } from "@/types/dashboard";

interface FormValues {
  type: AbsenceType;
  start_date: string;
  end_date: string;
  reason: string;
}

interface CreateAbsenceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const TYPE_OPTIONS: { value: AbsenceType; label: string; color: string; activeBg: string; activeText: string }[] = [
  { value: "vacation", label: "Vacation", color: "border-blue-200 bg-blue-50/60", activeBg: "bg-blue-600 border-blue-600", activeText: "text-white" },
  { value: "sick", label: "Sick leave", color: "border-rose-200 bg-rose-50/60", activeBg: "bg-rose-600 border-rose-600", activeText: "text-white" },
  { value: "conference", label: "Conference", color: "border-violet-200 bg-violet-50/60", activeBg: "bg-violet-600 border-violet-600", activeText: "text-white" },
];

const schema = yup.object({
  type: yup.string().oneOf(["vacation", "sick", "conference"] as AbsenceType[]).required("Type is required."),
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

export default function CreateAbsenceSheet({ open, onOpenChange, userId }: CreateAbsenceSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: { type: "vacation", start_date: "", end_date: "", reason: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset({ type: "vacation", start_date: "", end_date: "", reason: "" });
  }, [open, reset]);

  const { createAbsence, isLoading: isPending } = useCreateAbsence();
  const selectedType = watch("type");

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  async function onSubmit({ type, start_date, end_date, reason }: FormValues) {
    try {
      await createAbsence({ userId, type, start_date, end_date, reason: reason || undefined });
      handleClose();
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => { if (!v) handleClose(); }}
      title="Add Absence"
      description="Record a planned or past absence for this employee"
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
            {isPending ? "Adding…" : "Add Absence"}
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
                {TYPE_OPTIONS.map((opt) => {
                  const active = selectedType === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue("type", opt.value, { shouldDirty: true, shouldValidate: true })}
                      className={cn(
                        "rounded-xl border-2 px-3 py-2.5 text-[12px] font-semibold transition-all duration-150",
                        active ? `${opt.activeBg} ${opt.activeText}` : `${opt.color} text-foreground hover:opacity-80`,
                      )}
                    >
                      {opt.label}
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
                <Input
                  {...field}
                  type="date"
                  aria-invalid={!!errors.start_date}
                />
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
                <Input
                  {...field}
                  type="date"
                  aria-invalid={!!errors.end_date}
                />
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
