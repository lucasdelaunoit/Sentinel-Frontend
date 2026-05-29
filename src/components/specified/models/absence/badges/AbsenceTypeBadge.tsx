import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { AbsenceType, ABSENCE_TYPE_LABEL } from "@/types/absence";

interface AbsenceTypeBadgeProps {
  type: AbsenceType | null | undefined;
  className?: string;
}

const TYPE_STYLE: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
  [AbsenceType.Conference]: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
  [AbsenceType.Training]: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  [AbsenceType.Parental]: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  [AbsenceType.Sabbatical]: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
  [AbsenceType.Other]: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/60",
};

const UNSPECIFIED_STYLE = "bg-muted text-muted-foreground ring-1 ring-border";

export default function AbsenceTypeBadge({ type, className }: AbsenceTypeBadgeProps) {
  if (!type) return <Badge className={cn(UNSPECIFIED_STYLE, className)}>Unspecified</Badge>;
  return <Badge className={cn(TYPE_STYLE[type], className)}>{ABSENCE_TYPE_LABEL[type]}</Badge>;
}
