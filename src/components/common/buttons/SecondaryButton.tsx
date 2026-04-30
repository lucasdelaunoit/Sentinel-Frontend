import { cn } from "@/lib/utils.ts";

interface SecondaryButtonProps {
  label?: string;
  onClick?: () => void;
  className?: string;
}

export function SecondaryButton({
  label = "View all →",
  onClick,
  className,
}: SecondaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mt-3 w-full py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer",
        className,
      )}
    >
      {label}
    </button>
  );
}
