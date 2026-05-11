import type { ElementType, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface DataDisplayProps {
  icon: ElementType;
  label: string;
  value?: string | null;
  empty?: ReactNode;
  error?: ReactNode;
}

export default function DataDisplay({ icon: Icon, label, value, empty = "—", error }: DataDisplayProps) {
  const content = error ? (
    <span className="text-destructive">{error}</span>
  ) : value != null && value !== "" ? (
    <p className="text-foreground">{value}</p>
  ) : (
    <p className="text-muted-foreground">{empty}</p>
  );

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="size-3.5" />
        <span className="mt-0.5">{label}</span>
      </div>
      <span className="text-sm font-medium truncate">{content}</span>
    </div>
  );
}

DataDisplay.Skeleton = function DataDisplaySkeleton({ icon: Icon, label }: Pick<DataDisplayProps, "icon" | "label">) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="size-3" />
        {label}
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  );
};
