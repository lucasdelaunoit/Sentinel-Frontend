import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { PROJECT_STATUS_BG } from "@/lib/theme/projectStatus.ts";
import { AVATAR_SIZE, type AvatarSize } from "@/lib/theme/avatar.ts";

export type CompanyHolidayAvatarSizes = AvatarSize;

interface CompanyHolidayAvatarProps {
  dayNumber: number;
  variant?: ProjectStatus;
  size?: CompanyHolidayAvatarSizes;
}

export default function CompanyHolidayAvatar({ dayNumber, variant = "active", size = "base" }: CompanyHolidayAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        AVATAR_SIZE[size],
        PROJECT_STATUS_BG[variant],
      )}
    >
      {dayNumber}
    </div>
  );
}

CompanyHolidayAvatar.Skeleton = function CompanyHolidayAvatarSkeleton({ size = "base" }: { size?: CompanyHolidayAvatarSizes }) {
  return <Skeleton className={cn("rounded-xl shrink-0", AVATAR_SIZE[size])} />;
};
