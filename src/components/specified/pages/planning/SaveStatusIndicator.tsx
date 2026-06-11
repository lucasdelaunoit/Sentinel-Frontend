import { CheckIcon, CircleNotchIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils.ts";
import type { SimulateStatus } from "@/api/planning/useSimulatePlanning.ts";

interface SaveStatusIndicatorProps {
  status: SimulateStatus;
  className?: string;
}

const META: Record<SimulateStatus, { label: string; Icon: typeof CheckIcon; cls: string; spin?: boolean }> = {
  idle: { label: "Up to date", Icon: CheckIcon, cls: "text-muted-foreground" },
  pending: { label: "Saving …", Icon: CircleNotchIcon, cls: "text-muted-foreground", spin: true },
  saved: { label: "Saved", Icon: CheckIcon, cls: "text-success" },
  error: { label: "Invalid range", Icon: WarningCircleIcon, cls: "text-danger" },
};

export default function SaveStatusIndicator({ status, className }: SaveStatusIndicatorProps) {
  const meta = META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", meta.cls, className)}>
      <meta.Icon className={cn("size-3", meta.spin && "animate-spin")} />
      {meta.label}
    </span>
  );
}
