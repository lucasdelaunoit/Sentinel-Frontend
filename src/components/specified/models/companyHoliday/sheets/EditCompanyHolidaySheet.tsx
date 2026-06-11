import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useUpdateCompanyHoliday from "@/api/settings/companyHoliday/useUpdateCompanyHoliday";
import CalendarImpactDialog from "@/components/specified/pages/settings/CalendarImpactDialog";
import { useCalendarChangeGuard } from "@/hooks/useCalendarChangeGuard";

const MAX_NAME_LENGTH = 64;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface FormValues {
  name: string;
  start_date: string;
  end_date: string;
  recurring: boolean;
}

interface EditCompanyHolidaySheetProps {
  holiday: CompanyHoliday;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCompanyHolidaySheet({ holiday, open, onOpenChange }: EditCompanyHolidaySheetProps) {
  const schema = yup.object({
    name: yup
      .string()
      .required("Name is required.")
      .min(2, "Name must be at least 2 characters.")
      .max(MAX_NAME_LENGTH, `Name must be ${MAX_NAME_LENGTH} characters or fewer.`),
    start_date: yup.string().required("Start date is required.").matches(DATE_RE, "Date must be YYYY-MM-DD."),
    end_date: yup
      .string()
      .required("End date is required.")
      .matches(DATE_RE, "Date must be YYYY-MM-DD.")
      .test("after-start", "End date must be on or after start date.", function (value) {
        const { start_date } = this.parent as FormValues;
        return !value || !start_date || value >= start_date;
      }),
    recurring: yup.boolean().required(),
  });

  const initialStart = holiday.start_date.slice(0, 10);
  const initialEnd = holiday.end_date.slice(0, 10);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: holiday.name, start_date: initialStart, end_date: initialEnd, recurring: holiday.recurring },
    mode: "onChange",
  });

  useEffect(() => {
    if (open)
      reset({ name: holiday.name, start_date: initialStart, end_date: initialEnd, recurring: holiday.recurring });
  }, [open, holiday, initialStart, initialEnd, reset]);

  const startWatch = watch("start_date");
  const endWatch = watch("end_date");
  useEffect(() => {
    if (startWatch && endWatch && endWatch < startWatch) {
      setValue("end_date", startWatch, { shouldValidate: true, shouldDirty: true });
    }
  }, [startWatch, endWatch, setValue]);

  const { updateCompanyHoliday: updateHoliday, isLoading: isPending } = useUpdateCompanyHoliday();
  const guard = useCalendarChangeGuard();

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name, start_date, end_date, recurring }: FormValues) {
    const next = { name: name.trim(), start_date, end_date, recurring };
    // Guard: confirm impact on future absences before saving the holiday edit.
    guard.run({ type: "holiday_update", holiday_id: holiday.id, holiday: next }, (freezeIds) =>
      updateHoliday({ id: holiday.id, ...next, freeze_absence_ids: freezeIds }, { onSuccess: handleClose }),
    );
  }

  return (
    <>
      <ComposedSheet
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
        }}
        title="Edit Holiday"
        description="Update the holiday name, dates or recurrence."
        footer={
          <>
            <Button variant="outline" onClick={handleClose} className="flex-1" disabled={isPending} size="lg">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || !isValid || isPending || guard.isChecking}
              className="flex-1"
              size="lg"
            >
              {isPending ? "Saving…" : guard.isChecking ? "Checking…" : "Save changes"}
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
                  Holiday Name <span className="text-destructive-foreground">*</span>
                </FieldLabel>
                <Input
                  {...field}
                  placeholder="e.g. Easter Monday, Summer Shutdown"
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
                  <FieldDescription>Displayed in the holidays list and leave calendar</FieldDescription>
                )}
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
                    Start <span className="text-destructive-foreground">*</span>
                  </FieldLabel>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
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
                    End <span className="text-destructive-foreground">*</span>
                  </FieldLabel>
                  <Input
                    type="date"
                    value={field.value}
                    min={startWatch || undefined}
                    onChange={(e) => field.onChange(e.target.value)}
                    aria-invalid={!!errors.end_date}
                  />
                  {errors.end_date && <FieldError>{errors.end_date.message}</FieldError>}
                </Field>
              )}
            />
          </div>
          <FieldDescription>
            Single-day holiday: leave start and end the same. Otherwise, span any range.
          </FieldDescription>

          <Controller
            name="recurring"
            control={control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  id="edit-recurring-checkbox"
                />
                <FieldLabel htmlFor="edit-recurring-checkbox" className="font-normal cursor-pointer">
                  Recurring yearly
                  <FieldDescription className="mt-0.5">
                    Repeats on the same month/day range every year.
                  </FieldDescription>
                </FieldLabel>
              </Field>
            )}
          />
        </div>
      </ComposedSheet>

      <CalendarImpactDialog {...guard.dialog} isApplying={isPending} />
    </>
  );
}
