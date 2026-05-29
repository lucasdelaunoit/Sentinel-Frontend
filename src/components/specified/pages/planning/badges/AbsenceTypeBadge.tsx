import { cn } from "@/lib/utils";
import type { AbsenceType } from "@/types/absence";
import { absenceTheme } from "@/utils/planning/theme";

interface AbsenceTypeBadgeProps {
  type: AbsenceType | null;
  className?: string;
}

export default function AbsenceTypeBadge({ type, className }: AbsenceTypeBadgeProps) {
  const meta = absenceTheme(type);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] text-muted-foreground", className)}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
