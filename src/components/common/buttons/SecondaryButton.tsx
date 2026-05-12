import { cn } from "@/lib/utils.ts";
import type { PropsWithChildren } from "react";

interface SecondaryButtonProps extends PropsWithChildren {
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SecondaryButton({ children, onClick, className, disabled }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex justify-center items-center gap-1 w-full py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted/40 disabled:text-muted-foreground/60 disabled:hover:bg-muted/40 disabled:hover:text-muted-foreground/60",
        className,
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
