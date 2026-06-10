import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ComposedSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  subheader?: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  children: ReactNode;
  side?: "right" | "left" | "top" | "bottom";
  maxWidth?: string;
  className?: string;
  onClose?: () => void;
}

export default function ComposedSheet({
  open,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  subheader,
  footer,
  footerClassName,
  children,
  maxWidth = "sm:max-w-[360px]",
  className,
  onClose,
}: ComposedSheetProps) {
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  const controlledProps =
    open !== undefined
      ? {
          open,
          onOpenChange: (v: boolean) => {
            if (!v) handleClose();
          },
        }
      : {};

  return (
    <Sheet {...controlledProps}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side="right" showCloseButton={false} className={cn("flex flex-col p-0 gap-0", maxWidth, className)}>
        <SheetHeader className="px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {icon && (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  {icon}
                </div>
              )}
              <div>
                <SheetTitle>{title}</SheetTitle>
                {description && <SheetDescription className="mt-0.5">{description}</SheetDescription>}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </SheetHeader>

        {subheader && <div className="px-6 py-3 border-b border-border/40">{subheader}</div>}

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">{children}</div>

        {footer && (
          <SheetFooter className={cn("px-6 py-4 border-t border-border/60 flex-row gap-2.5", footerClassName)}>
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
