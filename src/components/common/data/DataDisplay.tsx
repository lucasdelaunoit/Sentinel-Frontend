import type { ElementType, ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface DataDisplayBaseProps {
  icon: ElementType;
  label: string;
}

interface DataDisplayProps extends DataDisplayBaseProps {
  value: string;
}

/**
 * Shared wrapper and header layout to avoid duplication between
 * DataDisplay and DataDisplay.Skeleton
 */
function DataDisplayContainer({ icon: Icon, label, children }: DataDisplayBaseProps & { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        <Icon className="size-3" />
        {label}
      </div>
      {children}
    </div>
  );
}

export default function DataDisplay({ icon, label, value }: DataDisplayProps) {
  return (
    <DataDisplayContainer icon={icon} label={label}>
      <p className="text-[13px] font-medium text-foreground truncate">{value}</p>
    </DataDisplayContainer>
  );
}

DataDisplay.Skeleton = function DataDisplaySkeleton({ icon, label }: DataDisplayBaseProps) {
  return (
    <DataDisplayContainer icon={icon} label={label}>
      <Skeleton className="h-4 w-full" />
    </DataDisplayContainer>
  );
};
