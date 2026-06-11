import { CalendarBlankIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils.ts";
import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { SEVERITY_TEXT } from "@/lib/theme/severity.ts";

/** Minimal metric shape rendered by the card — satisfied by both StatCardData and MetricResult. */
interface DeadlineCardValue {
  value: string;
  severity: Severity;
  value_raw?: number | string | null;
  raw?: number | null;
  insight?: string | null;
}

interface DeadlineCountdownCardProps {
  title?: string;
  card?: DeadlineCardValue;
  onClick?: () => void;
}

export default function DeadlineCountdownCard({
  title = "Deadline",
  card,
  onClick,
}: DeadlineCountdownCardProps) {
  const days = Math.max(Number(card?.value_raw ?? card?.raw ?? 0), 0);
  const color = (card && SEVERITY_TEXT[card.severity]) || "text-foreground";

  return (
    <Card
      className={cn("py-6 gap-3", onClick && "cursor-pointer hover:bg-muted/30 transition-colors")}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">{title}</span>
        <span className="text-muted-foreground opacity-60">
          <CalendarBlankIcon className="size-5" />
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tabular-nums">{days}</span>
        <span className="text-sm text-muted-foreground">days</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className={cn("flex items-center gap-1 text-sm font-semibold", color)}>
          <ArrowRightIcon size={13} />
          <span>{card?.insight}</span>
        </div>
      </div>
    </Card>
  );
}

DeadlineCountdownCard.Skeleton = function DeadlineCountdownCardSkeleton({
  title = "Deadline",
}: Pick<DeadlineCountdownCardProps, "title">) {
  return (
    <Card className="py-6 gap-3">
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">{title}</span>
        <span className="text-muted-foreground opacity-60">
          <CalendarBlankIcon className="size-5" />
        </span>
      </div>
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-4 w-32" />
    </Card>
  );
};
