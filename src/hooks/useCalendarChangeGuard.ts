import { useRef, useState } from "react";
import useCalendarImpactPreview, {
  type CalendarChangePayload,
  type CalendarImpactAffected,
} from "@/api/calendar/useCalendarImpactPreview";

type ApplyFn = (freezeAbsenceIds: number[]) => void;

/**
 * Guards a calendar change (working week / holiday) behind an impact check:
 * previews which future absences would be recounted and, if any, defers the apply
 * until the user resolves the confirmation modal. When nothing is affected it applies
 * immediately with no modal.
 *
 * Usage:
 *   const guard = useCalendarChangeGuard();
 *   guard.run({ type: "working_days", working_days: next }, (freezeIds) =>
 *     updateSettings.mutate({ working_days: next, freeze_absence_ids: freezeIds }));
 *   // render: <CalendarImpactDialog {...guard.dialog} isApplying={...} />
 */
export function useCalendarChangeGuard() {
  const { previewImpact, isLoading: isChecking } = useCalendarImpactPreview();
  const [affected, setAffected] = useState<CalendarImpactAffected[]>([]);
  const [open, setOpen] = useState(false);
  const applyRef = useRef<ApplyFn | null>(null);

  async function run(payload: CalendarChangePayload, apply: ApplyFn) {
    let result: CalendarImpactAffected[] = [];
    try {
      result = await previewImpact(payload);
    } catch {
      // Preview failed — fall through and apply without freezing (live recount).
      result = [];
    }

    if (result.length === 0) {
      apply([]);
      return;
    }

    applyRef.current = apply;
    setAffected(result);
    setOpen(true);
  }

  function onConfirm(freezeAbsenceIds: number[]) {
    applyRef.current?.(freezeAbsenceIds);
    applyRef.current = null;
    setOpen(false);
  }

  function onCancel() {
    applyRef.current = null;
    setOpen(false);
  }

  return {
    run,
    isChecking,
    dialog: { open, affected, onConfirm, onCancel },
  };
}
