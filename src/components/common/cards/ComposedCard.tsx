import { type ReactNode } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";
import { cn } from "@/lib/utils.ts";

interface ComposedCardProps {
  title: string | ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function ComposedCard({ title, action, children, className, headerClassName }: ComposedCardProps) {
  return (
    <Card className={cn("p-5 flex flex-col", className)}>
      <div className={cn("flex items-center justify-between gap-3", headerClassName)}>
        <CardTitle className="shrink-0">{title}</CardTitle>
        {action}
      </div>
      <CardContent className="p-0 flex-1">{children}</CardContent>
    </Card>
  );
}
