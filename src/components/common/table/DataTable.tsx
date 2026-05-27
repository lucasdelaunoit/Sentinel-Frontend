import { useState, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import ComposedCard from "@/components/common/cards/ComposedCard";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableTableHead } from "@/components/common/table/SortableTableHead";
import { TablePagination } from "@/components/common/table/TablePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useTablePagination } from "@/hooks/useTablePagination";
import FilterPillGroup, { type FilterPillOption } from "@/components/common/filters/FilterPillGroup";
import { cn } from "@/lib/utils";
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel";

export interface DataTableColumn<T, S extends string = string> {
  key: string;
  header: ReactNode;
  sortKey?: S;
  cell: (row: T, ctx: { search: string }) => ReactNode;
  skeleton?: ReactNode;
  className?: string;
  stopPropagation?: boolean;
}

export interface DataTableFilter<F> {
  options: FilterPillOption<F | null>[];
  field: string;
}

interface DataTableProps<T, S extends string, F> {
  title: string;
  hook: (params: LaravelQueryParams) => UseQueryResult<LaravelPaginatedResponse<T>>;
  columns: DataTableColumn<T, S>[];
  defaultSort: S;
  defaultSortDir?: "asc" | "desc";
  searchPlaceholder?: string;
  filter?: DataTableFilter<F>;
  includes?: string[];
  defaultPerPage?: number;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string | number;
  emptyMessage?: string;
  errorMessage?: string;
  rowClassName?: (row: T) => string | undefined;
}

export default function DataTable<T extends { id: string | number }, S extends string, F = string>({
  title,
  hook,
  columns,
  defaultSort,
  defaultSortDir = "asc",
  searchPlaceholder = "Search...",
  filter,
  includes,
  defaultPerPage = 15,
  onRowClick,
  rowKey,
  emptyMessage = "No results match your filters.",
  errorMessage = "Failed to load data. Check API connection.",
  rowClassName,
}: DataTableProps<T, S, F>) {
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState<F | null>(null);
  const { sort, toggleSort } = useTableSort<S>(defaultSort, defaultSortDir);
  const { page, setPage, perPage, setPerPage } = useTablePagination(defaultPerPage, [search, filterValue]);

  const { data, isLoading, isError } = hook({
    page,
    per_page: perPage,
    search: search || undefined,
    sorts: [{ field: sort.key, direction: sort.dir }],
    filters:
      filter && filterValue !== null
        ? [{ field: filter.field, value: filterValue as unknown as string | number | boolean | string[] }]
        : undefined,
    includes,
  });

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const lastPage = data?.last_page ?? 1;
  const from = data?.from ?? 0;
  const to = data?.to ?? 0;
  const colSpan = columns.length;

  const toolbarAction = (
    <>
      {!isLoading && (
        <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
          {total}
        </span>
      )}
      <div className="flex-1" />
      {filter && <FilterPillGroup options={filter.options} value={filterValue} onChange={setFilterValue} />}
      <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder} />
    </>
  );

  const skeletonRowCount = perPage > 10 ? 8 : perPage;

  return (
    <ComposedCard
      title={title}
      action={toolbarAction}
      className="p-0 overflow-hidden"
      headerClassName="px-6 pt-4 flex-wrap gap-3"
    >
      <Table className="text-sm">
        <TableHeader>
          <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
            {columns.map((col) =>
              col.sortKey ? (
                <SortableTableHead
                  key={col.key}
                  label={col.header as string}
                  col={col.sortKey}
                  sortKey={sort.key}
                  sortDir={sort.dir}
                  onSort={toggleSort}
                />
              ) : (
                <TableHead
                  key={col.key}
                  className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70"
                >
                  {col.header}
                </TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody className="[&_tr]:border-border/40">
          {isLoading ? (
            Array.from({ length: skeletonRowCount }).map((_, i) => (
              <TableRow key={i} className="border-border/40">
                {columns.map((col) => (
                  <TableCell key={col.key} className={cn("px-5 py-4", col.className)}>
                    {col.skeleton ?? <Skeleton className="h-4 w-24" />}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : isError ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={colSpan} className="px-6 py-12 text-center text-sm text-muted-foreground">
                {errorMessage}
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="border-border/40">
              <TableCell colSpan={colSpan} className="px-6 py-12 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={rowKey ? rowKey(row) : row.id}
                className={cn(
                  "transition-colors border-border/40",
                  onRowClick && "hover:bg-muted/20 group cursor-pointer",
                  rowClassName?.(row),
                )}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn("px-5 py-4", col.className)}
                    onClick={col.stopPropagation ? (e) => e.stopPropagation() : undefined}
                  >
                    {col.cell(row, { search })}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!isLoading && !isError && (
        <TablePagination
          page={page}
          lastPage={lastPage}
          perPage={perPage}
          total={total}
          from={from}
          to={to}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </ComposedCard>
  );
}
