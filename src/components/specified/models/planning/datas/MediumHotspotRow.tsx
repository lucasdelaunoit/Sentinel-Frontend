import { FlameIcon } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import { SEVERITY_BADGE } from "@/lib/theme/severity.ts";
import { cn } from "@/lib/utils.ts";
import { formatRange } from "@/utils/planning/calendar.ts";

const MAX_AVATARS = 4;

interface MediumHotspotRowProps {
  hotspot: Hotspot;
  usersById: Map<string, PlanningUser>;
  className?: string;
  onClick?: () => void;
}

export default function MediumHotspotRow({ hotspot, usersById, className, onClick }: MediumHotspotRowProps) {
  const [start, end] = hotspot.date_range;
  const absentUsers = hotspot.absent_user_ids
    .map((id) => usersById.get(id))
    .filter((user): user is PlanningUser => Boolean(user));
  const visibleUsers = absentUsers.slice(0, MAX_AVATARS);
  const extraUsers = hotspot.absent_user_ids.length - visibleUsers.length;
  const projectCount = hotspot.projects_impacted.length;

  return (
    <SecondaryCard
      className={cn("items-center gap-4 p-4", className)}
      onClick={onClick}
      before={
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            SEVERITY_BADGE[hotspot.severity],
          )}
        >
          <FlameIcon className="size-4" weight="bold" />
        </div>
      }
      title={
        <span className="text-[15px] font-semibold leading-tight text-foreground">
          {formatRange(start, end) ?? `${start} – ${end}`}
        </span>
      }
      description={
        <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
          {hotspot.reason}
          {projectCount > 0 && ` · ${projectCount} ${projectCount === 1 ? "project" : "projects"} impacted`}
        </span>
      }
      action={
        <div className="flex flex-col items-end gap-2">
          <SeverityBadge severity={hotspot.severity} />
          <div className="flex items-center gap-1">
            {visibleUsers.map((user) => (
              <UserAvatar key={user.id} firstname={user.firstname} lastname={user.lastname} variant={user.status} />
            ))}
            {extraUsers > 0 && (
              <span className="flex size-8 items-center justify-center rounded-xl bg-muted text-[11px] font-bold text-muted-foreground">
                +{extraUsers}
              </span>
            )}
          </div>
        </div>
      }
    />
  );
}

MediumHotspotRow.Skeleton = function MediumHotspotRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-tertiary p-4">
      <Skeleton className="size-10 shrink-0 rounded-lg" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <UserAvatar.Skeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
