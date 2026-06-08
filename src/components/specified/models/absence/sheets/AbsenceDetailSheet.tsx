import { useState } from "react";
import { CalendarDays } from "lucide-react";
import {
  CalendarCheckIcon,
  CalendarXIcon,
  ClockCountdownIcon,
  NotePencilIcon,
  HourglassIcon,
  TrashIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import DataDisplay from "@/components/common/data/DataDisplay";
import LifecycleBadge from "@/components/specified/models/absence/badges/LifecycleBadge";
import useDeleteAbsence from "@/api/absences/useDeleteAbsence.ts";
import { dateRelativeLabel, lifecycleKey } from "@/utils/absence/lifecycle";
import { halfRangeDuration, ABSENCE_HALF_LABEL } from "@/utils/absence/halfDay";
import { formatDate } from "@/utils/formatters/date";
import { capitalize } from "@/utils/formatters/string.ts";

interface AbsenceDetailSheetProps {
  /** Null while the record is still loading — the sheet opens with a skeleton body and fills in on arrival. */
  absence: Absence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function AbsenceDetailSheet({ absence, open, onOpenChange, userId }: AbsenceDetailSheetProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteAbsence, isLoading: isDeleting } = useDeleteAbsence();

  async function confirmDelete() {
    if (!absence) return;
    try {
      await deleteAbsence({ id: absence.id, userId });
      setDeleteOpen(false);
      onOpenChange(false);
    } catch {
      /* hook toasts */
    }
  }

  // Keep the sheet mounted and swap only the body: skeleton → data, no remount/flash.
  if (!absence) {
    return (
      <ComposedSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Absence details"
        description="Timing, type and notes at a glance."
      >
        <AbsenceDetailBodySkeleton />
      </ComposedSheet>
    );
  }

  const lk = lifecycleKey(absence.start_date, absence.end_date);
  const days = halfRangeDuration(absence);
  const anchorDate = lk === "past" ? absence.end_date : absence.start_date;
  const relLabel = dateRelativeLabel(anchorDate, lk);

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Absence details"
      description="Timing, type and notes at a glance."
      footer={
        <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={isDeleting} className="flex-1 gap-1.5" size="lg">
          {isDeleting ? <CircleNotchIcon className="animate-spin" weight="bold" /> : <TrashIcon weight="bold" />}
          Delete absence
        </Button>
      }
    >
      <div className="rounded-2xl border border-border/60 bg-tertiary p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Duration
            </span>
            <span className="mt-1 text-[40px] font-black leading-none tabular-nums text-foreground">
              {days}
              <span className="ml-1 text-[16px] font-bold text-muted-foreground">day{days !== 1 ? "s" : ""}</span>
            </span>
            <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <ClockCountdownIcon className="size-3" />
              {relLabel}
            </span>
          </div>
          <LifecycleBadge lifecycle={lk} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay
          icon={CalendarCheckIcon}
          label="Start"
          value={`${formatDate(absence.start_date)} · ${ABSENCE_HALF_LABEL[absence.start_half ?? "morning"]}`}
        />
        <DataDisplay
          icon={CalendarXIcon}
          label="End"
          value={`${formatDate(absence.end_date)} · ${ABSENCE_HALF_LABEL[absence.end_half ?? "afternoon"]}`}
        />
      </div>

      <DataDisplay icon={HourglassIcon} label="Type" value={capitalize(absence.type ?? "")} />

      <div className="rounded-xl border border-border/60 bg-muted/10 px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <NotePencilIcon className="size-3.5" />
          <span className="mt-0.5">Note</span>
        </div>
        {absence.reason?.trim() ? (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{absence.reason}</p>
        ) : (
          <p className="text-sm text-muted-foreground">—</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay icon={CalendarDays} label="Created" value={formatDate(absence.created_at)} />
        <DataDisplay icon={CalendarDays} label="Last updated" value={formatDate(absence.updated_at)} />
      </div>

      <ComposedAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this absence?"
        description="This will permanently remove the absence record and cannot be undone."
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isPending={isDeleting}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </ComposedSheet>
  );
}

/** Body-only skeleton, shared by the loading sheet and the standalone `.Skeleton`. */
function AbsenceDetailBodySkeleton() {
  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-tertiary p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay.Skeleton icon={CalendarCheckIcon} label="Start" />
        <DataDisplay.Skeleton icon={CalendarXIcon} label="End" />
      </div>

      <DataDisplay.Skeleton icon={HourglassIcon} label="Duration" />

      <div className="rounded-xl border border-border/60 bg-muted/10 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <NotePencilIcon className="size-3.5" />
            <span className="mt-0.5">Note</span>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-1.5 h-4 w-3/4" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay.Skeleton icon={CalendarDays} label="Created" />
        <DataDisplay.Skeleton icon={CalendarDays} label="Last updated" />
      </div>
    </>
  );
}

AbsenceDetailSheet.Skeleton = function AbsenceDetailSheetSkeleton({
  open,
  onOpenChange,
}: Pick<AbsenceDetailSheetProps, "open" | "onOpenChange">) {
  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Absence details"
      description="Timing, type and notes at a glance."
    >
      <AbsenceDetailBodySkeleton />
    </ComposedSheet>
  );
};
