import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CaretDoubleLeftIcon, CaretDoubleRightIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface DataPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function DataPagination({ page, totalPages, onPageChange, disabled = false, className }: DataPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  return (
    <div
      className={cn("pt-3 border-t border-border/40", disabled && "pointer-events-none opacity-50", className)}
      aria-disabled={disabled}
    >
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to first page"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(1);
              }}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-40" : ""}
            >
              <CaretDoubleLeftIcon />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.max(1, page - 1));
              }}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-40" : ""}
            />
          </PaginationItem>

          {pages.map((entry, i) =>
            entry === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <PaginationLink
                  href="#"
                  isActive={entry === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(entry);
                  }}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(Math.min(totalPages, page + 1));
              }}
              aria-disabled={page === totalPages}
              className={page === totalPages ? "pointer-events-none opacity-40" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to last page"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(totalPages);
              }}
              aria-disabled={page === totalPages}
              className={page === totalPages ? "pointer-events-none opacity-40" : ""}
            >
              <CaretDoubleRightIcon />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function buildPageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const result: (number | "ellipsis")[] = [1];

  if (current > 3) result.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) result.push(p);

  if (current < total - 2) result.push("ellipsis");

  result.push(total);
  return result;
}
