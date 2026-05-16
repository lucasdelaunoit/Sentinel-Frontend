import { cn } from "@/lib/utils";
import type { AbsenceType } from "@/types/dashboard";
import { ABSENCE_THEME } from "@/utils/planning/theme";

interface AbsenceTypeBadgeProps {
  type: AbsenceType;
  className?: string;
}

export default function AbsenceTypeBadge({ type, className }: AbsenceTypeBadgeProps) {
  const meta = ABSENCE_THEME[type];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-[11px] text-muted-foreground", className)}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
