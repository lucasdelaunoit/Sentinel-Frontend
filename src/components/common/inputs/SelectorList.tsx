import { Fragment, type ReactNode } from "react";
import SearchBar from "@/components/common/inputs/SearchBar";

interface SelectorListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  renderSkeleton: () => ReactNode;
  selected?: ReactNode;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  skeletonCount?: number;
  maxHeight?: string;
}

export default function SelectorList<T>({
  items,
  renderItem,
  renderSkeleton,
  selected,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  isLoading = false,
  emptyMessage = "No items found.",
  skeletonCount = 5,
  maxHeight = "max-h-72",
}: SelectorListProps<T>) {
  const isEmpty = !isLoading && items.length === 0;

  return (
    <>
      {selected && <div className="pb-3">{selected}</div>}

      <SearchBar
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        size="sm"
        className="[&_input]:w-full"
      />

      <div
        className={`mt-3 overflow-y-auto rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/40 ${maxHeight}`}
      >
        {isLoading ? (
          Array.from({ length: skeletonCount }).map((_, i) => <Fragment key={i}>{renderSkeleton()}</Fragment>)
        ) : isEmpty ? (
          <div className="p-4 text-[12.5px] text-muted-foreground">{emptyMessage}</div>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </>
  );
}
