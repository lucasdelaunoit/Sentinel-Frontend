import { cn } from "@/lib/utils.ts";

interface StatusAvatarProps {
  initials: string;
  variant?: EmployeeStatus;
}

const STATUS_VARIANTS: Record<EmployeeStatus, string> = {
  available: "bg-success-foreground",
  away: "bg-danger-foreground",
};

export default function EmployeeAvatar({ initials, variant }: StatusAvatarProps) {
  return (
    <div
      className={cn(
        "flex size-8 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm",
        variant ? STATUS_VARIANTS[variant] : "bg-primary-foreground",
      )}
    >
      {initials}
    </div>
  );
}
