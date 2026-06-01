import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PencilSimpleIcon, TrashIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import AbsenceDetailSheet from "@/components/specified/models/absence/sheets/AbsenceDetailSheet.tsx";
import EditAbsenceSheet from "@/components/specified/models/absence/sheets/EditAbsenceSheet.tsx";
import useDeleteAbsence from "@/api/absences/useDeleteAbsence.ts";
import { absenceDuration, dateRelativeLabel, fmtDate } from "@/utils/absence/lifecycle.ts";
import DurationBadge from "@/components/specified/models/absence/badges/DurationBadge.tsx";
import { capitalize } from "@/utils/formatters/string.ts";
import LifecycleBadge from "@/components/specified/models/absence/badges/LifecycleBadge.tsx";
import { classifyAbsenceLifecycle } from "@/utils/formatters/date.ts";

interface MediumAbsenceCardProps {
  absence: Absence;
  userId: string;
}

export default function MediumAbsenceCard({ absence, userId }: MediumAbsenceCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { deleteAbsence, isLoading: isDeleting } = useDeleteAbsence();

  const days = absenceDuration(absence.start_date, absence.end_date);
  const lk = classifyAbsenceLifecycle(absence.start_date, absence.end_date);
  const anchorDate = lk === "past" ? absence.end_date : absence.start_date;

  async function confirmDelete() {
    try {
      await deleteAbsence({ id: absence.id, userId });
      setDeleteOpen(false);
    } catch {
      /* hook toasts */
    }
  }

  return (
    <>
      <SecondaryCard
        onClick={() => setDetailOpen(true)}
        before={
          <div className="flex w-14 shrink-0 flex-col items-center gap-1 py-2 text-center">
            <DurationBadge days={days} />
            <span className="text-[10px] font-medium text-muted-foreground">{dateRelativeLabel(anchorDate, lk)}</span>
          </div>
        }
        title={
          <span className="flex items-center gap-2 font-bold">
            {absence.type ? capitalize(absence.type) : <i>Geen type</i>}
            <LifecycleBadge lifecycle={lk} />
          </span>
        }
        description={
          <div className="space-y-1.5 mt-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[12px] font-semibold tabular-nums text-foreground">
                {fmtDate(absence.start_date)}
              </span>
              <ArrowRight className="size-3 text-muted-foreground/60" />
              <span className="text-[12px] font-semibold tabular-nums text-foreground">
                {fmtDate(absence.end_date)}
              </span>
            </div>
            <p className="truncate text-[11px] text-muted-foreground">{absence.reason ?? "No reason provided"}</p>
          </div>
        }
        action={
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              className="hover:bg-card"
              aria-label="Edit absence"
            >
              <PencilSimpleIcon />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteOpen(true);
              }}
              disabled={isDeleting}
              aria-label="Delete absence"
            >
              {isDeleting ? <CircleNotchIcon className="animate-spin" weight="bold" /> : <TrashIcon />}
            </Button>
          </div>
        }
        className="p-3"
      />

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

      <AbsenceDetailSheet absence={absence} open={detailOpen} onOpenChange={setDetailOpen} userId={userId} />
      <EditAbsenceSheet absence={absence} userId={userId} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}

MediumAbsenceCard.Skeleton = function MediumAbsenceCardSkeleton() {
  return (
    <SecondaryCard
      className="bg-tertiary p-3"
      before={
        <div className="flex w-14 shrink-0 flex-col items-center gap-1 py-2">
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-3 w-10" />
        </div>
      }
      title={
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      }
      description={
        <div className="space-y-1.5 mt-1">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      }
      action={
        <div className="flex items-center gap-1 ml-4 shrink-0">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      }
    />
  );
};
