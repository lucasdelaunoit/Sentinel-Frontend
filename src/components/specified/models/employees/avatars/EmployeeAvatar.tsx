import { cn } from "@/lib/utils.ts";

export type EmployeeAvatarSizes = Extract<Sizes, "base" | "lg">;

interface StatusAvatarProps {
  initials: string;
  variant?: EmployeeStatus;
  size?: EmployeeAvatarSizes;
}

const STATUS_VARIANTS: Record<EmployeeStatus, string> = {
  available: "bg-success-foreground",
  away: "bg-danger-foreground",
};

const SIZE_VARIANTS: Record<EmployeeAvatarSizes, string> = {
  base: "size-8 text-[11px] font-bold",
  lg: "size-10 text-[13px] font-medium",
};

export default function EmployeeAvatar({ initials, variant, size = "base" }: StatusAvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl text-white shadow-sm",
        SIZE_VARIANTS[size],
        variant ? STATUS_VARIANTS[variant] : "bg-red-500",
      )}
    >
      {initials}
    </div>
  );
}
