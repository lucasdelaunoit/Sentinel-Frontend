import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useUpdateCompanyHoliday from "@/api/company-holidays/useUpdateCompanyHoliday";

const MAX_NAME_LENGTH = 64;

interface FormValues {
  name: string;
  date: string;
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
    date: yup
      .string()
      .required("Date is required.")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD."),
    recurring: yup.boolean().required(),
  });

  const initialDate = holiday.date.slice(0, 10);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: holiday.name, date: initialDate, recurring: holiday.recurring },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset({ name: holiday.name, date: initialDate, recurring: holiday.recurring });
  }, [open, holiday, initialDate, reset]);

  const { mutate: updateHoliday, isPending } = useUpdateCompanyHoliday();

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  function onSubmit({ name, date, recurring }: FormValues) {
    updateHoliday({ id: holiday.id, name: name.trim(), date, recurring }, { onSuccess: handleClose });
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
      title="Edit Holiday"
      description="Update the holiday name, date or recurrence."
      icon={<CalendarDays className="size-4 text-primary" />}
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
          name="name"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Holiday Name <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Input
                {...field}
                placeholder="e.g. Easter Monday, Labour Day"
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

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                Date <span className="text-destructive-foreground">*</span>
              </FieldLabel>
              <Input
                type="date"
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                aria-invalid={!!errors.date}
              />
              {errors.date ? (
                <FieldError>{errors.date.message}</FieldError>
              ) : (
                <FieldDescription>Enable "Recurring yearly" to repeat across years</FieldDescription>
              )}
            </Field>
          )}
        />

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
                  Applies on the same month/day every year (e.g. Christmas Day).
                </FieldDescription>
              </FieldLabel>
            </Field>
          )}
        />
      </div>
    </ComposedSheet>
  );
}
