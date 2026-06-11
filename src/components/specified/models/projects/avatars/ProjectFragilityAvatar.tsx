import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { getProjectInitials } from "@/utils/formatters/projects.ts";
import { SEVERITY_BG } from "@/lib/theme/severity.ts";
import { AVATAR_SIZE, type AvatarSize } from "@/lib/theme/avatar.ts";

export type ProjectFragilityAvatarSizes = AvatarSize;

interface ProjectFragilityAvatarProps {
  name: string;
  fragilitySeverity?: Severity;
  size?: ProjectFragilityAvatarSizes;
}

export default function ProjectFragilityAvatar({
  name,
  fragilitySeverity = "ok",
  size = "base",
}: ProjectFragilityAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        AVATAR_SIZE[size],
        SEVERITY_BG[fragilitySeverity],
      )}
    >
      {getProjectInitials(name)}
    </div>
  );
}

interface ProjectFragilityBadgeSkeletonProps {
  size?: ProjectFragilityAvatarSizes;
}

ProjectFragilityAvatar.Skeleton = function ProjectAvatarSkeleton({
  size = "base",
}: ProjectFragilityBadgeSkeletonProps) {
  return <Skeleton className={cn("rounded-xl shrink-0", AVATAR_SIZE[size])} />;
};
