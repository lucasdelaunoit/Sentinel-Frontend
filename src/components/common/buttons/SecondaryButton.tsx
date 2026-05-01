import { cn } from "@/lib/utils.ts";

interface SecondaryButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function SecondaryButton({ label = "View all →", onClick, className }: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
        className,
      )}
    >
      {label}
    </button>
  );
}
