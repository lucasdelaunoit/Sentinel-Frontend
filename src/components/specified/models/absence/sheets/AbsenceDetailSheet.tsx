import { Trash2 } from "lucide-react";
import { CalendarBlankIcon, ClockCountdownIcon } from "@phosphor-icons/react";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog";
import { Button } from "@/components/ui/button";
import useDeleteAbsence from "@/api/absences/useDeleteAbsence";
import { cn } from "@/lib/utils";
import type { AbsenceItem, AbsenceType, AbsenceStatus } from "@/types/dashboard";

interface AbsenceDetailSheetProps {
  absence: AbsenceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const ABSENCE_TYPE_STYLES: Record<AbsenceType, string> = {
  vacation: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
  sick: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
  conference: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
};
const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  vacation: "Vacation",
  sick: "Sick leave",
  conference: "Conference",
};
const ABSENCE_STATUS_STYLES: Record<AbsenceStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
};
const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

function fmtLong(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", weekday: "short" });
}

function durationDays(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
}

function relativeStatus(start: string, end: string): { label: string; tone: "ongoing" | "upcoming" | "past" } {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now < s) {
    const days = Math.ceil((s - now) / 86_400_000);
    return { label: `Starts in ${days} day${days !== 1 ? "s" : ""}`, tone: "upcoming" };
  }
  if (now > e) {
    const days = Math.ceil((now - e) / 86_400_000);
    return { label: `Ended ${days} day${days !== 1 ? "s" : ""} ago`, tone: "past" };
  }
  return { label: "Currently absent", tone: "ongoing" };
}

const TONE_STYLES = {
  ongoing: "bg-rose-50 text-rose-700 ring-rose-200/60",
  upcoming: "bg-amber-50 text-amber-700 ring-amber-200/60",
  past: "bg-muted/60 text-muted-foreground ring-border/60",
};

export default function AbsenceDetailSheet({ absence, open, onOpenChange, userId }: AbsenceDetailSheetProps) {
  const { deleteAbsence, isLoading: isPending } = useDeleteAbsence();

  if (!absence) {
    return (
      <ComposedSheet open={open} onOpenChange={onOpenChange} title="Absence" description="Loading…">
        <div />
      </ComposedSheet>
    );
  }

  const rel = relativeStatus(absence.start_date, absence.end_date);
  const days = durationDays(absence.start_date, absence.end_date);

  async function handleDelete() {
    if (!absence) return;
    try {
      await deleteAbsence({ id: absence.id, userId });
      onOpenChange(false);
    } catch {
      /* toast handled in hook */
    }
  }

  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Absence details"
      description="Full record of this absence"
      icon={<CalendarBlankIcon className="size-4 text-primary" />}
      footer={
        <ComposedAlertDialog
          trigger={
            <Button variant="outline" className="flex-1 gap-1.5" size="lg">
              <Trash2 className="size-4" />
              Delete absence
            </Button>
          }
          title="Delete absence?"
          description="This will permanently remove this absence record and cannot be undone."
          confirmLabel="Delete"
          pendingLabel="Deleting…"
          variant="destructive"
          isPending={isPending}
          onConfirm={handleDelete}
        />
      }
    >
      <div className="space-y-4">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", ABSENCE_TYPE_STYLES[absence.type])}>
            {ABSENCE_TYPE_LABELS[absence.type]}
          </span>
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", ABSENCE_STATUS_STYLES[absence.status])}>
            {ABSENCE_STATUS_LABELS[absence.status]}
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", TONE_STYLES[rel.tone])}>
            <ClockCountdownIcon className="size-3" />
            {rel.label}
          </span>
        </div>

        {/* Period */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5 space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Start</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{fmtLong(absence.start_date)}</p>
          </div>
          <div className="border-t border-border/40 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">End</p>
            <p className="text-[13px] font-medium text-foreground mt-0.5">{fmtLong(absence.end_date)}</p>
          </div>
          <div className="border-t border-border/40 pt-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Duration</p>
            <p className="text-[14px] font-bold text-foreground tabular-nums">
              {days} day{days !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Reason</p>
          <p className="text-[13px] text-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">
            {absence.reason?.trim() || <span className="text-muted-foreground/50">No reason provided.</span>}
          </p>
        </div>

        {/* Meta */}
        <div className="rounded-xl border border-border/60 bg-card px-4 py-3.5 space-y-2 text-[11px] text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Created</span>
            <span className="text-foreground font-medium">{fmtLong(absence.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last updated</span>
            <span className="text-foreground font-medium">{fmtLong(absence.updated_at)}</span>
          </div>
        </div>
      </div>
    </ComposedSheet>
  );
}
