import { type ElementType } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { StatCardData } from "@/types/dashboard";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "text-destructive-foreground",
  warning: "text-amber-500",
  ok: "text-emerald-600",
};

interface StatCardProps {
  title: string;
  icon: ElementType;
  card: StatCardData;
  onClick?: () => void;
  isLoading?: boolean;
}

export default function StatCard({ title, icon: Icon, card, onClick, isLoading = false }: StatCardProps) {
  const color = SEVERITY_COLOR[card.severity] || "text-foreground";

  if (isLoading) return <StatCard.Skeleton title={title} icon={Icon} />;

  return (
    <Card
      className={cn("py-6 gap-3", onClick && "cursor-pointer hover:bg-muted/30 transition-colors")}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">{title}</span>
        <span className="text-muted-foreground opacity-60">
          <Icon className="size-5" />
        </span>
      </div>
      <div className={cn("text-3xl font-semibold")}>{card.value}</div>
      <div className="flex flex-col gap-0.5">
        <div className={cn("flex items-center gap-1 text-sm font-semibold", color)}>
          <ArrowRightIcon size={13} />
          <span>{card.hint}</span>
        </div>
      </div>
    </Card>
  );
}

StatCard.Skeleton = function StatCardSkeleton({ title, icon: Icon }: Pick<StatCardProps, "title" | "icon">) {
  return (
    <Card className="py-6 gap-3">
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
