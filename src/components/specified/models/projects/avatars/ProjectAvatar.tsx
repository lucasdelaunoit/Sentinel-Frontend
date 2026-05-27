import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { getProjectInitials } from "@/utils/formatters/projects.ts";

export type ProjectAvatarSizes = Extract<Sizes, "base" | "lg" | "xl" | "2xl">;

interface ProjectAvatarProps {
  name: string;
  variant?: ProjectStatus;
  size?: ProjectAvatarSizes;
}

const STATUS_VARIANTS: Record<ProjectStatus, string> = {
  planned: "bg-planned",
  active: "bg-primary",
  paused: "bg-warning",
  completed: "bg-info",
  archived: "bg-muted text-muted-foreground",
};

const SIZE_VARIANTS: Record<ProjectAvatarSizes, string> = {
  base: "size-8 text-[11px] font-bold",
  lg: "size-10 text-[13px] font-medium",
  xl: "size-14 text-[15px] font-semibold",
  "2xl": "size-20 text-xl font-bold",
};

export default function ProjectAvatar({ name, variant = "active", size = "base" }: ProjectAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        SIZE_VARIANTS[size],
        STATUS_VARIANTS[variant],
      )}
    >
      {getProjectInitials(name)}
    </div>
  );
}

ProjectAvatar.Skeleton = function ProjectAvatarSkeleton({ size = "base" }: { size?: ProjectAvatarSizes }) {
  return <Skeleton className={cn("rounded-xl shrink-0", SIZE_VARIANTS[size])} />;
};
