import { AlertCircle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import type { SimulateStatus } from "@/api/planning/useSimulatePlanning.ts";

interface SaveStatusIndicatorProps {
  status: SimulateStatus;
  className?: string;
}

const META: Record<SimulateStatus, { label: string; Icon: typeof Check; cls: string; spin?: boolean }> = {
  idle: { label: "Up to date", Icon: Check, cls: "text-muted-foreground" },
  pending: { label: "Saving …", Icon: Loader2, cls: "text-muted-foreground", spin: true },
  saved: { label: "Saved", Icon: Check, cls: "text-success" },
  error: { label: "Invalid range", Icon: AlertCircle, cls: "text-danger" },
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
