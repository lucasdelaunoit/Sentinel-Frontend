import { cn } from "@/lib/utils.ts";
import { type ReactNode } from "react";

interface SecondaryCardProps {
  before?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function SecondaryCard({
  before,
  title,
  description,
  action,
  onClick,
  className,
}: SecondaryCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-2 rounded-xl transition-colors",
        onClick && "cursor-pointer hover:bg-muted",
        className,
      )}
    >
      {before && <div className="shrink-0">{before}</div>}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
