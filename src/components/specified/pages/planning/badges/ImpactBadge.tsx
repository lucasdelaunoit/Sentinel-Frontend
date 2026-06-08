import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const META: Record<ImpactLevel, { label: string; Icon: typeof ShieldAlert; cls: string }> = {
  critical: {
    label: "Critical",
    Icon: ShieldAlert,
    cls: "bg-danger/10 text-destructive-foreground border-danger/30",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    cls: "bg-warning/10 text-warning border-warning/30",
  },
  safe: {
    label: "Safe",
    Icon: CheckCircle2,
    cls: "bg-success/10 text-success border-success/30",
  },
};

interface ImpactBadgeProps {
  level: ImpactLevel;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function ImpactBadge({ level, label, className, size = "sm" }: ImpactBadgeProps) {
  const meta = META[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        meta.cls,
        className,
      )}
    >
      <meta.Icon className={size === "sm" ? "size-3" : "size-3.5"} />
      <span>{label ?? meta.label}</span>
    </span>
  );
}
