import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { getInitials } from "@/utils/formatters/persons.ts";
import { USER_STATUS_BG } from "@/lib/theme/userStatus.ts";
import { AVATAR_SIZE, type AvatarSize } from "@/lib/theme/avatar.ts";

export type UserAvatarSizes = AvatarSize;

interface UserAvatarProps {
  firstname: string;
  lastname: string;
  variant?: UserStatus;
  size?: UserAvatarSizes;
}

export default function UserAvatar({ firstname, lastname, variant = "available", size = "base" }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        AVATAR_SIZE[size],
        USER_STATUS_BG[variant],
      )}
    >
      {getInitials(firstname, lastname)}
    </div>
  );
}

UserAvatar.Skeleton = function UserAvatarSkeleton({ size = "base" }: { size?: UserAvatarSizes }) {
  return <Skeleton className={cn("rounded-xl shrink-0", AVATAR_SIZE[size])} />;
};
