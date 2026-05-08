import { cn } from "@/lib/utils.ts";

export type UserAvatarSizes = Extract<Sizes, "base" | "lg">;

interface StatusAvatarProps {
  initials: string;
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
};

export default function UserAvatar({ initials, variant = "available", size = "base" }: StatusAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center select-none justify-center rounded-xl text-primary-foreground shadow-sm",
        SIZE_VARIANTS[size],
        STATUS_VARIANTS[variant],
      )}
    >
      {initials}
    </div>
  );
}
