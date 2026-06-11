import { type ElementType } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SEVERITY_TEXT } from "@/lib/theme/severity.ts";

/** Minimal metric shape rendered by the card — satisfied by both StatCardData and MetricResult. */
interface StatCardValue {
  value: string;
  severity: Severity;
  insight?: string | null;
}

interface StatCardProps {
  title: string;
  icon: ElementType;
  card?: StatCardValue;
  onClick?: () => void;
  className?: string;
}

export default function StatCard({ title, icon: Icon, card, onClick, className }: StatCardProps) {
  const color = (card && SEVERITY_TEXT[card.severity]) || "text-foreground";

  return (
    <Card
      className={cn("py-6 gap-3", onClick && "cursor-pointer hover:bg-muted/30 transition-colors", className)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">{title}</span>
        <span className="text-muted-foreground opacity-60">
          <Icon className="size-5" />
        </span>
      </div>
      <div className={cn("text-3xl font-semibold")}>{card?.value}</div>
      {card?.insight && (
        <div className="flex flex-col gap-0.5">
          <div className={cn("flex items-center gap-1 text-sm font-semibold", color)}>
            <ArrowRightIcon size={13} />
            <span>{card.insight}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

StatCard.Skeleton = function StatCardSkeleton({ title, icon: Icon, className }: Pick<StatCardProps, "title" | "icon" | "className">) {
  return (
    <Card className={cn("py-6 gap-3", className)}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">{title}</span>
        <span className="text-muted-foreground opacity-60">
          <Icon className="size-5" />
        </span>
      </div>
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-4 w-32" />
    </Card>
  );
};
