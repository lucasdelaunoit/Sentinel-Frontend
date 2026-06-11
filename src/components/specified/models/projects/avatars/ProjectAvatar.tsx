import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { getProjectInitials } from "@/utils/formatters/projects.ts";
import { PROJECT_STATUS_BG } from "@/lib/theme/projectStatus.ts";
import { AVATAR_SIZE, type AvatarSize } from "@/lib/theme/avatar.ts";

export type ProjectAvatarSizes = AvatarSize;

interface ProjectAvatarProps {
  name: string;
  variant?: ProjectStatus;
  size?: ProjectAvatarSizes;
}

export default function ProjectAvatar({ name, variant = "active", size = "base" }: ProjectAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        AVATAR_SIZE[size],
        PROJECT_STATUS_BG[variant],
      )}
    >
      {getProjectInitials(name)}
    </div>
  );
}

ProjectAvatar.Skeleton = function ProjectAvatarSkeleton({ size = "base" }: { size?: ProjectAvatarSizes }) {
  return <Skeleton className={cn("rounded-xl shrink-0", AVATAR_SIZE[size])} />;
};
