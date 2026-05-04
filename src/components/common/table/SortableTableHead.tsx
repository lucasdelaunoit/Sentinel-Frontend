import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

interface SortableTableHeadProps<K extends string> {
  label: string;
  col: K;
  sortKey: K;
  sortDir: "asc" | "desc";
  onSort: (k: K) => void;
  className?: string;
}

export function SortableTableHead<K extends string>({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  className,
}: SortableTableHeadProps<K>) {
  const active = sortKey === col;
  return (
    <TableHead
      onClick={() => onSort(col)}
      className={
        className ??
        "px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 cursor-pointer select-none hover:text-foreground transition-colors"
      }
    >
      <span className="flex items-center gap-1">
        {label}
        {active ? (
          sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
        ) : (
          <ChevronsUpDown className="size-3 opacity-40" />
        )}
      </span>
    </TableHead>
  );
}
