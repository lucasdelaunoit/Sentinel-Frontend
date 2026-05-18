import { type ReactNode } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";

interface ComposedCardProps {
  title: string | ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
}

export default function ComposedCard({
  title,
  action,
  footer,
  children,
  className,
  headerClassName,
  footerClassName,
}: ComposedCardProps) {
  return (
    <Card className={cn("p-5 flex flex-col", className)}>
      <div className={cn("flex items-center justify-between gap-3", headerClassName)}>
        <CardTitle className="shrink-0">{title}</CardTitle>
        {action}
      </div>
      <CardContent className="p-0 flex-1">{children}</CardContent>
      {footer && <div className={cn("flex items-center justify-end gap-2 pt-4", footerClassName)}>{footer}</div>}
    </Card>
  );
}
