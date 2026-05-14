import type { ReactNode, MouseEvent } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SelectorRowProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export default function SelectorRow({ active, onClick, children, className }: SelectorRowProps) {
  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    onClick();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-2.5 text-left cursor-pointer transition-colors",
        active ? "bg-primary/5" : "hover:bg-muted/40",
        className,
      )}
    >
      <div
        className={cn(
          "size-6 rounded-md grid place-items-center transition-colors shrink-0",
          active ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground",
        )}
      >
        <PlusIcon className="size-3.5" weight="bold" />
      </div>
      {children}
    </button>
  );
}
