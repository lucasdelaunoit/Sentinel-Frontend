import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useCreateAbsence from "@/api/absences/useCreateAbsence";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import { findOverlappingAbsence, formatHalfRange } from "@/utils/absence/halfDay.ts";
import AbsenceFormFields from "@/components/specified/models/absence/sheets/AbsenceFormFields.tsx";
import {
  ABSENCE_FORM_DEFAULTS,
  absenceSchema,
  type AbsenceFormValues,
} from "@/components/specified/models/absence/sheets/absenceForm.ts";

interface CreateAbsenceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function CreateAbsenceSheet({ open, onOpenChange, userId }: CreateAbsenceSheetProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<AbsenceFormValues>({
    resolver: yupResolver(absenceSchema) as never,
    defaultValues: ABSENCE_FORM_DEFAULTS,
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset(ABSENCE_FORM_DEFAULTS);
  }, [open, reset]);

  const { createAbsence, isLoading: isPending } = useCreateAbsence();

  // Existing absences for this user, to block overlapping ranges client-side.
  const { data: existing } = useGetAbsencesForUser(open ? userId : undefined, { per_page: 100 });

  const startDate = watch("start_date");
  const startHalf = watch("start_half");
  const endDate = watch("end_date");
  const endHalf = watch("end_half");

  const overlapError = useMemo(() => {
    const hit = findOverlappingAbsence(
      { start_date: startDate, start_half: startHalf, end_date: endDate, end_half: endHalf },
      existing ?? [],
    );
    return hit ? `Overlaps an existing absence: ${formatHalfRange(hit)}.` : null;
  }, [startDate, startHalf, endDate, endHalf, existing]);

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  async function onSubmit({ type, start_date, start_half, end_date, end_half, reason }: AbsenceFormValues) {
    if (overlapError) return;
    try {
      await createAbsence({ userId, type, start_date, start_half, end_date, end_half, reason: reason || undefined });
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
            disabled={!isDirty || !isValid || isPending || !!overlapError}
            className="flex-1"
            size="lg"
          >
            {isPending ? "Adding…" : "Add Absence"}
          </Button>
        </>
      }
    >
      <AbsenceFormFields
        control={control}
        errors={errors}
        setValue={setValue}
        watch={watch}
        defaultMode="single"
        resetKey={open ? "open" : "closed"}
        overlapError={overlapError}
      />
    </ComposedSheet>
  );
}
