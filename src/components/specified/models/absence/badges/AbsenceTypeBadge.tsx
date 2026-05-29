import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import type { AbsenceType } from "@/types/dashboard";

interface AbsenceTypeBadgeProps {
  type: AbsenceType;
  className?: string;
}

const TYPE_VARIANTS: Record<AbsenceType, { style: string; text: string }> = {
  vacation: { style: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60", text: "Vacation" },
  sick: { style: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60", text: "Sick leave" },
  conference: { style: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60", text: "Conference" },
  personal: { style: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60", text: "Personal" },
  other: { style: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/60", text: "Other" },
};

const DEFAULT_TYPE = { style: "bg-muted text-muted-foreground", text: "Unknown" };

export default function AbsenceTypeBadge({ type, className }: AbsenceTypeBadgeProps) {
  const variant = type && TYPE_VARIANTS[type] ? TYPE_VARIANTS[type] : DEFAULT_TYPE;
  return <Badge className={cn(variant.style, className)}>{variant.text}</Badge>;
}
