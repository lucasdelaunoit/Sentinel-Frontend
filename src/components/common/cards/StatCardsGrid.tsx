import { type ElementType } from "react";
import { cn } from "@/lib/utils.ts";
import StatCard, { type StatCardValue } from "@/components/common/cards/StatCard.tsx";

export interface StatCardsGridItem {
  title: string;
  icon: ElementType;
  card?: StatCardValue;
}

interface StatCardsGridProps {
  items: StatCardsGridItem[];
  isLoading?: boolean;
  className?: string;
}

/** Grid of StatCards that renders each item's Skeleton while loading or until its metric arrives. */
export default function StatCardsGrid({ items, isLoading = false, className }: StatCardsGridProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {items.map(({ title, icon, card }) =>
        isLoading || !card ? (
          <StatCard.Skeleton key={title} title={title} icon={icon} />
        ) : (
          <StatCard key={title} title={title} icon={icon} card={card} />
        ),
      )}
    </div>
  );
}
