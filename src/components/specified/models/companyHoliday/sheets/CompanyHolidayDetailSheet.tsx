import { useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { CalendarCheckIcon, CalendarBlankIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ComposedSheet from "@/components/common/sheets/ComposedSheet";
import ComposedAlertDialog from "@/components/common/dialogs/ComposedAlertDialog";
import DataDisplay from "@/components/common/data/DataDisplay";
import RecurringBadge from "@/components/specified/models/companyHoliday/badges/RecurringBadge";
import CompanyHolidayAvatar from "@/components/specified/models/companyHoliday/avatars/CompanyHolidayAvatar";
import EditCompanyHolidaySheet from "@/components/specified/models/companyHoliday/sheets/EditCompanyHolidaySheet";
import useDeleteCompanyHoliday from "@/api/company-holidays/useDeleteCompanyHoliday";
import { formatDate } from "@/utils/formatters/date";

interface CompanyHolidayDetailSheetProps {
  holiday: CompanyHoliday;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CompanyHolidayDetailSheet({ holiday, open, onOpenChange }: CompanyHolidayDetailSheetProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { mutate: deleteHoliday, isPending: isDeleting } = useDeleteCompanyHoliday();

  const start = new Date(holiday.start_date);
  const end = new Date(holiday.end_date);
  const dayNum = start.getDate();
  const sameDay = holiday.start_date === holiday.end_date;
  const startWeekday = start.toLocaleDateString("en-US", { weekday: "long" });
  const endWeekday = end.toLocaleDateString("en-US", { weekday: "long" });
  const weekdayLabel = sameDay ? startWeekday : `${startWeekday} → ${endWeekday}`;
  const startMonthDay = start.toLocaleString("en-US", { month: "long", day: "numeric" });
  const endMonthDay = end.toLocaleString("en-US", { month: "long", day: "numeric" });
  const monthDayLabel = sameDay ? startMonthDay : `${startMonthDay} → ${endMonthDay}`;
  const dayCount = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;

  function handleConfirmDelete() {
    deleteHoliday(holiday.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        onOpenChange(false);
      },
    });
  }

  return (
    <>
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Holiday details"
      description="Date, recurrence and metadata at a glance."
      footer={
        <>
          <ComposedAlertDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            trigger={
              <Button variant="destructive" className="flex-1" size="lg" disabled={isDeleting}>
                {isDeleting ? (
                  <CircleNotchIcon className="size-4 animate-spin" weight="bold" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
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
          <Button className="flex-1" size="lg" onClick={() => setEditOpen(true)} disabled={isDeleting}>
            <Pencil className="size-4" />
            Modify
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-border/60 bg-tertiary p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <CompanyHolidayAvatar dayNumber={dayNum} size="2xl" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Holiday
              </span>
              <span className="mt-1 text-[24px] font-black leading-tight text-foreground">{holiday.name}</span>
              <span className="mt-1 text-[12px] font-medium text-muted-foreground">
                {monthDayLabel} · {weekdayLabel}
              </span>
            </div>
          </div>
          {holiday.recurring && <RecurringBadge />}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay icon={CalendarCheckIcon} label="Start" value={formatDate(holiday.start_date)} />
        <DataDisplay icon={CalendarCheckIcon} label="End" value={formatDate(holiday.end_date)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay icon={CalendarBlankIcon} label="Weekday" value={weekdayLabel} />
        <DataDisplay icon={CalendarDays} label="Length" value={`${dayCount} day${dayCount > 1 ? "s" : ""}`} />
      </div>

    </ComposedSheet>
    <EditCompanyHolidaySheet holiday={holiday} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}

CompanyHolidayDetailSheet.Skeleton = function CompanyHolidayDetailSheetSkeleton({
  open,
  onOpenChange,
}: Pick<CompanyHolidayDetailSheetProps, "open" | "onOpenChange">) {
  return (
    <ComposedSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Holiday details"
      description="Date, recurrence and metadata at a glance."
    >
      <div className="rounded-2xl border border-border/60 bg-tertiary p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <CompanyHolidayAvatar.Skeleton size="2xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay.Skeleton icon={CalendarCheckIcon} label="Start" />
        <DataDisplay.Skeleton icon={CalendarCheckIcon} label="End" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DataDisplay.Skeleton icon={CalendarBlankIcon} label="Weekday" />
        <DataDisplay.Skeleton icon={CalendarDays} label="Length" />
      </div>

    </ComposedSheet>
  );
};
