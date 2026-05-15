import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { getInitials } from "@/utils/formatters/persons.ts";

export type UserAvatarSizes = Extract<Sizes, "base" | "lg" | "xl" | "2xl">;

interface StatusAvatarProps {
  firstname: string;
  lastname: string;
  variant?: UserStatus;
  size?: UserAvatarSizes;
}

const STATUS_VARIANTS: Record<UserStatus, string> = {
  available: "bg-success-foreground",
  away: "bg-danger-foreground",
};

const SIZE_VARIANTS: Record<UserAvatarSizes, string> = {
  base: "size-8 text-[11px] font-bold",
  lg: "size-10 text-[13px] font-medium",
  xl: "size-14 text-[15px] font-semibold",
  "2xl": "size-20 text-xl font-bold",
};

export default function UserAvatar({ firstname, lastname, variant = "available", size = "base" }: StatusAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        SIZE_VARIANTS[size],
        STATUS_VARIANTS[variant],
      )}
    >
      {getInitials(firstname, lastname)}
    </div>
  );
}

UserAvatar.Skeleton = function UserAvatarSkeleton({ size = "base" }: { size?: UserAvatarSizes }) {
  return <Skeleton className={cn("rounded-xl shrink-0", SIZE_VARIANTS[size])} />;
};
