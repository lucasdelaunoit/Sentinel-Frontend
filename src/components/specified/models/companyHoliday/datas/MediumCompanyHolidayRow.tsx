import { useState } from "react";
import { Trash2 } from "lucide-react";
import { CircleNotchIcon } from "@phosphor-icons/react";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog.tsx";
import RecurringBadge from "@/components/specified/models/companyHoliday/badges/RecurringBadge.tsx";
import CompanyHolidayAvatar from "@/components/specified/models/companyHoliday/avatars/CompanyHolidayAvatar.tsx";
import useDeleteCompanyHoliday from "@/api/company-holidays/useDeleteCompanyHoliday.ts";

interface MediumCompanyHolidayRowProps {
  holiday: CompanyHoliday;
  deletable?: boolean;
  onDeleted?: () => void;
  className?: string;
  onClick?: () => void;
}

export default function MediumCompanyHolidayRow({
  holiday,
  deletable = true,
  onDeleted,
  className,
  onClick,
}: MediumCompanyHolidayRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteCompanyHoliday: deleteHoliday, isLoading: isDeleting } = useDeleteCompanyHoliday();

  const start = new Date(holiday.start_date);
  const end = new Date(holiday.end_date);
  const dayNum = start.getDate();
  const sameDay = holiday.start_date === holiday.end_date;
  const startMonthDay = start.toLocaleString("en-US", { month: "long", day: "numeric" });
  const endMonthDay = end.toLocaleString("en-US", { month: "long", day: "numeric" });
  const startFull = start.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const endFull = end.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const dateLabel = holiday.recurring
    ? (sameDay ? `${startMonthDay} (yearly)` : `${startMonthDay} → ${endMonthDay} (yearly)`)
    : (sameDay ? startFull : `${startFull} → ${endFull}`);
  const weekdayLabel = sameDay
    ? start.toLocaleDateString("en-US", { weekday: "short" })
    : `${start.toLocaleDateString("en-US", { weekday: "short" })} → ${end.toLocaleDateString("en-US", { weekday: "short" })}`;

  function handleConfirmDelete() {
    deleteHoliday(holiday.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onDeleted?.();
      },
    });
  }

  return (
    <SecondaryCard
      className={className}
      onClick={onClick}
      before={<CompanyHolidayAvatar dayNumber={dayNum} size="lg" />}
      title={holiday.name}
      description={`${dateLabel} · ${weekdayLabel}`}
      action={
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {holiday.recurring && <RecurringBadge />}
          {deletable && (
            <ComposedAlertDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              trigger={
                <Button variant="destructive" size="sm" className="h-8 w-8 p-0" disabled={isDeleting}>
                  {isDeleting ? <CircleNotchIcon className="animate-spin" weight="bold" /> : <Trash2 className="size-3.5" />}
                </Button>
              }
              title={`Delete holiday "${holiday.name}"?`}
              description={
                holiday.recurring
                  ? "This recurring holiday will be removed from every year and unblocked in the leave calendar. This cannot be undone."
                  : "This holiday will be removed and unblocked in the leave calendar. This cannot be undone."
              }
              confirmLabel="Delete"
              pendingLabel="Deleting…"
              cancelLabel="Cancel"
              isPending={isDeleting}
              variant="destructive"
              onConfirm={handleConfirmDelete}
            />
          )}
        </div>
      }
    />
  );
}

MediumCompanyHolidayRow.Skeleton = function MediumCompanyHolidayRowSkeleton({ className }: { className?: string }) {
  return (
    <SecondaryCard
      className={cn(className)}
      before={<Skeleton className="size-10 rounded-xl shrink-0" />}
      title={<Skeleton className="h-3.5 w-32" />}
      description={<Skeleton className="h-3 w-40" />}
      action={
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      }
    />
  );
};
