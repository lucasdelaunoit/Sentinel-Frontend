import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PER_PAGE_OPTIONS = [10, 15, 25, 50] as const;

interface TablePaginationProps {
  page: number;
  lastPage: number;
  perPage: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (p: number) => void;
  onPerPageChange: (n: number) => void;
}

export function TablePagination({
  page,
  lastPage,
  perPage,
  total,
  from,
  to,
  onPageChange,
  onPerPageChange,
}: TablePaginationProps) {
  if (total === 0) return null;

  const count = Math.min(5, lastPage);
  let start = Math.max(1, page - 2);
  if (start + count - 1 > lastPage) start = Math.max(1, lastPage - count + 1);
  const pageNumbers = Array.from({ length: count }, (_, i) => start + i);

  return (
    <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between bg-muted/10 flex-wrap gap-3">
      <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
        <span>Show</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="border border-border/60 rounded-lg bg-card px-2 py-1 text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>per page · {from}–{to} of {total}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page <= 1} onClick={() => onPageChange(1)}>
          <ChevronsLeft className="size-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-3.5" />
        </Button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "h-8 min-w-8 px-2 rounded-lg text-[12px] font-medium transition-all",
              page === p
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border/60 bg-card text-foreground hover:bg-muted/50",
            )}
          >
            {p}
          </button>
        ))}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page >= lastPage} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="size-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page >= lastPage} onClick={() => onPageChange(lastPage)}>
          <ChevronsRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
