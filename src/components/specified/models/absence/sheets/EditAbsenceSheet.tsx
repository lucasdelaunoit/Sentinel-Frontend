import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import useUpdateAbsence from "@/api/absence/useUpdateAbsence";
import useGetAbsencesForUser from "@/api/absence/useGetAbsencesForUser.ts";
import { findOverlappingAbsence, formatHalfRange } from "@/utils/absence/halfDay.ts";
import AbsenceFormFields from "@/components/specified/models/absence/sheets/AbsenceFormFields.tsx";
import { absenceSchema, type AbsenceFormValues } from "@/components/specified/models/absence/sheets/absenceForm.ts";

interface EditAbsenceSheetProps {
  absence: Absence;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function defaults(absence: Absence): AbsenceFormValues {
  return {
    type: absence.type ?? "vacation",
    start_date: absence.start_date,
    start_half: absence.start_half ?? "morning",
    end_date: absence.end_date,
    end_half: absence.end_half ?? "afternoon",
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
  } = useForm<AbsenceFormValues>({
    resolver: yupResolver(absenceSchema) as never,
    defaultValues: defaults(absence),
    mode: "onChange",
  });

  useEffect(() => {
    if (open) reset(defaults(absence));
  }, [open, absence, reset]);

  const { updateAbsence, isLoading: isPending } = useUpdateAbsence();

  // Other absences for this user, to block overlapping ranges (current record excluded).
  const { data: existing } = useGetAbsencesForUser(open ? userId : undefined, { per_page: 100 });

  const startDate = watch("start_date");
  const startHalf = watch("start_half");
  const endDate = watch("end_date");
  const endHalf = watch("end_half");

  const overlapError = useMemo(() => {
    const hit = findOverlappingAbsence(
      { start_date: startDate, start_half: startHalf, end_date: endDate, end_half: endHalf },
      existing ?? [],
      absence.id,
    );
    return hit ? `Overlaps another absence: ${formatHalfRange(hit)}.` : null;
  }, [startDate, startHalf, endDate, endHalf, existing, absence.id]);

  function handleClose() {
    onOpenChange(false);
  }

  async function onSubmit({ type, start_date, start_half, end_date, end_half, reason }: AbsenceFormValues) {
    if (overlapError) return;
    try {
      await updateAbsence({
        id: absence.id,
        userId,
        type,
        start_date,
        start_half,
        end_date,
        end_half,
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
            disabled={!isDirty || !isValid || isPending || !!overlapError}
            className="flex-1"
            size="lg"
          >
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <AbsenceFormFields
        control={control}
        errors={errors}
        setValue={setValue}
        watch={watch}
        defaultMode={absence.start_date === absence.end_date ? "single" : "period"}
        resetKey={`${absence.id}-${open}`}
        overlapError={overlapError}
      />
    </ComposedSheet>
  );
}
