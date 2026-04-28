import { cn } from "@/lib/utils.ts";
import { type ElementType, type ReactNode } from "react";
import { Card } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface StatCardProps {
  title: string;
  value: ReactNode;
  comment: ReactNode;
  icon: ElementType;
  onClick?: () => void;
  isLoading: boolean;
}

export default function StatCard({
  title,
  value,
  comment,
  icon: Icon,
  onClick,
  isLoading
}: StatCardProps) {

  if(isLoading)
    return <StatCardSkeleton />;

  return (
    <Card className={cn("py-6 gap-3", onClick && "cursor-pointer hover:bg-muted/30 transition-colors")} onClick={onClick}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-normal text-muted-foreground tracking-wide">
          {title}
        </span>
        <span className="text-muted-foreground opacity-60"><Icon className="h-4"/></span>
      </div>
      <div className="text-3xl font-semibold"> {/*style={{ fontSize: "34px", fontWeight: 800, color: theme.text, letterSpacing: "-0.03em", lineHeight: 1.15, marginTop: "2px" }}*/}
        {value}
      </div>
      {comment}
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="px-5 py-6 gap-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-5 w-5 rounded-sm" />
      </div>
      <Skeleton className="h-10 w-20 mt-2" />
      <Skeleton className="h-3.5 w-40 mt-2" />
    </Card>
  );
}