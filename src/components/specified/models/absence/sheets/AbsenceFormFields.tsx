import { useState } from "react";
import { Controller, type Control, type FieldErrors, type UseFormSetValue, type UseFormWatch } from "react-hook-form";
import { WarningIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { ABSENCE_TYPE_LABEL, ABSENCE_TYPE_VALUES } from "@/utils/absence/absenceType.ts";
import { ABSENCE_HALF_LABEL, ABSENCE_HALF_VALUES } from "@/utils/absence/halfDay.ts";
import { type AbsenceFormValues } from "./absenceForm.ts";

export type AbsenceDateMode = "single" | "period";

/* Single-day portions, expressed via the underlying start/end halves. */
const SINGLE_OPTIONS: { key: string; label: string; start: AbsenceHalf; end: AbsenceHalf }[] = [
  { key: "morning", label: "Morning", start: "morning", end: "morning" },
  { key: "afternoon", label: "Afternoon", start: "afternoon", end: "afternoon" },
  { key: "full", label: "Full day", start: "morning", end: "afternoon" },
];

/* ─── Uniform segmented button (choices) ─────────────────── */

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-[12px] font-semibold transition-all duration-150",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/60 bg-background text-muted-foreground hover:text-foreground hover:border-border",
      )}
    >
      {children}
    </button>
  );
}

/* ─── Compact track switch (single ↔ period) ─────────────── */

function ModeSwitch({ mode, onChange }: { mode: AbsenceDateMode; onChange: (mode: AbsenceDateMode) => void }) {
  return (
    <div className="inline-flex rounded-lg bg-muted/60 p-0.5">
      {(["single", "period"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cn(
            "rounded-md px-3 py-1 text-[11px] font-semibold transition-all duration-150",
            mode === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === "single" ? "Single day" : "Period"}
        </button>
      ))}
    </div>
  );
}

/* ─── Shared field block ─────────────────────────────────── */

interface AbsenceFormFieldsProps {
  control: Control<AbsenceFormValues>;
  errors: FieldErrors<AbsenceFormValues>;
  setValue: UseFormSetValue<AbsenceFormValues>;
  watch: UseFormWatch<AbsenceFormValues>;
  /** Initial single/period mode, derived by the parent from the record. */
  defaultMode: AbsenceDateMode;
  /** Changes when the underlying record/session changes, to re-sync the mode. */
  resetKey: string;
  /** Human-readable overlap message, or null when the range is free. */
  overlapError?: string | null;
}

export default function AbsenceFormFields({
  control,
  errors,
  setValue,
  watch,
  defaultMode,
  resetKey,
  overlapError,
}: AbsenceFormFieldsProps) {
  const selectedType = watch("type");
  const startDate = watch("start_date");
  const startHalf = watch("start_half");
  const endHalf = watch("end_half");

  // Re-sync the single/period mode when the record/session changes (render-phase
  // adjustment — no effect needed).
  const [mode, setMode] = useState<AbsenceDateMode>(defaultMode);
  const [syncedKey, setSyncedKey] = useState(resetKey);
  if (syncedKey !== resetKey) {
    setSyncedKey(resetKey);
    setMode(defaultMode);
  }

  function selectType(value: AbsenceType) {
    setValue("type", value, { shouldDirty: true, shouldValidate: true });
  }

  function switchMode(next: AbsenceDateMode) {
    if (next === mode) return;
    if (next === "single") {
      // Collapse to one full day on the start date.
      setValue("end_date", startDate || "", { shouldDirty: true, shouldValidate: true });
      setValue("start_half", "morning", { shouldDirty: true });
      setValue("end_half", "afternoon", { shouldDirty: true, shouldValidate: true });
    }
    setMode(next);
  }

  function setSingleDate(value: string) {
    setValue("start_date", value, { shouldDirty: true, shouldValidate: true });
    setValue("end_date", value, { shouldDirty: true, shouldValidate: true });
  }

  function setSinglePortion(option: (typeof SINGLE_OPTIONS)[number]) {
    setValue("start_half", option.start, { shouldDirty: true });
    setValue("end_half", option.end, { shouldDirty: true, shouldValidate: true });
  }

  const singleValue =
    startHalf === "morning" && endHalf === "afternoon"
      ? "full"
      : startHalf === "morning" && endHalf === "morning"
        ? "morning"
        : startHalf === "afternoon" && endHalf === "afternoon"
          ? "afternoon"
          : null;

  function setHalf(field: "start_half" | "end_half", value: AbsenceHalf) {
    setValue(field, value, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <div className="space-y-4">
      {/* Type — uniform selector */}
      <Field>
        <FieldLabel>
          Type <span className="text-destructive-foreground">*</span>
        </FieldLabel>
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {ABSENCE_TYPE_VALUES.map((value) => (
            <SegButton key={value} active={selectedType === value} onClick={() => selectType(value)}>
              {ABSENCE_TYPE_LABEL[value]}
            </SegButton>
          ))}
        </div>
        {errors.type && <FieldError>{errors.type.message}</FieldError>}
      </Field>

      {/* When — schedule section, visually grouped */}
      <div className="space-y-3 rounded-2xl border border-border/60 bg-tertiary/40 p-3.5">
        <div className="flex items-center justify-between">
          <FieldLabel className="mb-0">
            When <span className="text-destructive-foreground">*</span>
          </FieldLabel>
          <ModeSwitch mode={mode} onChange={switchMode} />
        </div>

        {mode === "single" ? (
          /* ── Single day: one date + Morning / Afternoon / Full day ── */
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => (
              <Field>
                <Input
                  type="date"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => setSingleDate(e.target.value)}
                  aria-invalid={!!errors.start_date}
                />
                <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                  {SINGLE_OPTIONS.map((option) => (
                    <SegButton
                      key={option.key}
                      active={singleValue === option.key}
                      onClick={() => setSinglePortion(option)}
                    >
                      {option.label}
                    </SegButton>
                  ))}
                </div>
                {errors.start_date && <FieldError>{errors.start_date.message}</FieldError>}
              </Field>
            )}
          />
        ) : (
          /* ── Period: two dates, each with its boundary half ── */
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-[11px] text-muted-foreground">Start date</FieldLabel>
                  <Input {...field} type="date" aria-invalid={!!errors.start_date} />
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {ABSENCE_HALF_VALUES.map((half) => (
                      <SegButton key={half} active={startHalf === half} onClick={() => setHalf("start_half", half)}>
                        {ABSENCE_HALF_LABEL[half]}
                      </SegButton>
                    ))}
                  </div>
                  {errors.start_date && <FieldError>{errors.start_date.message}</FieldError>}
                </Field>
              )}
            />

            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-[11px] text-muted-foreground">End date</FieldLabel>
                  <Input {...field} type="date" aria-invalid={!!errors.end_date} />
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {ABSENCE_HALF_VALUES.map((half) => (
                      <SegButton key={half} active={endHalf === half} onClick={() => setHalf("end_half", half)}>
                        {ABSENCE_HALF_LABEL[half]}
                      </SegButton>
                    ))}
                  </div>
                  {errors.end_date && <FieldError>{errors.end_date.message}</FieldError>}
                </Field>
              )}
            />
          </div>
        )}
      </div>

      {/* Overlap warning */}
      {overlapError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-3.5 py-2.5">
          <WarningIcon className="mt-0.5 size-4 shrink-0 text-destructive" weight="fill" />
          <p className="text-[12px] font-medium leading-snug text-destructive">{overlapError}</p>
        </div>
      )}

      {/* Reason */}
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
  );
}
