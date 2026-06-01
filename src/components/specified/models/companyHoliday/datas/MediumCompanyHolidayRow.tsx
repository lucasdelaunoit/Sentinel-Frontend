import { Trash2 } from "lucide-react";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import RecurringBadge from "@/components/specified/models/companyHoliday/badges/RecurringBadge.tsx";
import CompanyHolidayAvatar from "@/components/specified/models/companyHoliday/avatars/CompanyHolidayAvatar.tsx";

interface MediumCompanyHolidayRowProps {
  holiday: CompanyHoliday;
  onDelete?: (id: number) => void;
  className?: string;
  onClick?: () => void;
}

export default function MediumCompanyHolidayRow({
  holiday,
  onDelete,
  className,
  onClick,
}: MediumCompanyHolidayRowProps) {
  const d = new Date(holiday.date);
  const dayNum = d.getDate();
  const dateLabel = holiday.recurring
    ? `${d.toLocaleString("en-US", { month: "long", day: "numeric" })} (yearly)`
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const weekdayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

  return (
    <SecondaryCard
      className={className}
      onClick={onClick}
      before={<CompanyHolidayAvatar dayNumber={dayNum} size="lg" />}
      title={holiday.name}
      description={`${dateLabel} · ${weekdayLabel}`}
      action={
        <div className="flex items-center gap-3">
          {holiday.recurring && <RecurringBadge />}
          {onDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(holiday.id);
              }}
              size="sm"
              variant="destructive"
              className="h-8 w-8 p-0"
            >
              <Trash2 className="size-3.5" />
            </Button>
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
