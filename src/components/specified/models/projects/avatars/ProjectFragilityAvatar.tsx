import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { getProjectInitials } from "@/utils/formatters/projects.ts";

export type ProjectFragilityAvatarSizes = Extract<Sizes, "base" | "lg" | "xl" | "2xl">;

interface ProjectFragilityAvatarProps {
  name: string;
  fragilitySeverity?: Severity;
  size?: ProjectFragilityAvatarSizes;
}

const STATUS_VARIANTS: Record<Severity, string> = {
  critical: "bg-danger",
  warning: "bg-warning",
  ok: "bg-success",
};

const SIZE_VARIANTS: Record<ProjectFragilityAvatarSizes, string> = {
  base: "size-8 text-[11px] font-bold",
  lg: "size-10 text-[13px] font-medium",
  xl: "size-14 text-[15px] font-semibold",
  "2xl": "size-20 text-xl font-bold",
};

export default function ProjectFragilityAvatar({
  name,
  fragilitySeverity = "ok",
  size = "base",
}: ProjectFragilityAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        SIZE_VARIANTS[size],
        STATUS_VARIANTS[fragilitySeverity],
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
  return <Skeleton className={cn("rounded-xl shrink-0", SIZE_VARIANTS[size])} />;
};
