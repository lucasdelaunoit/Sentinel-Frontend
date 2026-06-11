import { useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";

/* ─── Request types ─────────────────────────────────────────── */

export interface SortParam {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterParam {
  field: string;
  value: string | number | boolean | string[];
}

export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  filters?: FilterParam[];
  sorts?: SortParam[];
  includes?: string[];
}

/** Raw Laravel paginator payload as returned by the API. */
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

/* ─── Query-string builder ──────────────────────────────────── */

/**
 * Serialises `QueryParams` into a URL search string
 * (`?page=…&filter[x]=…&sort=…&include=…`). Search is debounced.
 * Use inside paginated list hooks before calling `useQuery`.
 */
export function useQueryString(params: QueryParams = {}, debounceMs = 350): string {
  const { page, per_page, search, filters, sorts, includes } = params;
  const debouncedSearch = useDebounce(search ?? "", debounceMs);

  return useMemo(() => {
    const parts: string[] = [];

    if (page !== undefined && page >= 1) parts.push(`page=${page}`);
    if (per_page !== undefined && per_page >= 1 && per_page <= 100) parts.push(`per_page=${per_page}`);
    if (debouncedSearch) parts.push(`search=${encodeURIComponent(debouncedSearch)}`);

    if (filters && filters.length > 0) {
      for (const { field, value } of filters) {
        const encoded = Array.isArray(value)
          ? value.map((v) => encodeURIComponent(String(v))).join(",")
          : encodeURIComponent(String(value));
        parts.push(`filter[${field}]=${encoded}`);
      }
    }

    if (sorts && sorts.length > 0) {
      const sortString = sorts.map((s) => (s.direction === "desc" ? `-${s.field}` : s.field)).join(",");
      parts.push(`sort=${sortString}`);
    }

    if (includes && includes.length > 0) parts.push(`include=${includes.join(",")}`);

    return parts.length > 0 ? `?${parts.join("&")}` : "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, per_page, debouncedSearch, JSON.stringify(filters), JSON.stringify(sorts), JSON.stringify(includes)]);
}

/* ─── Paginator flattener ───────────────────────────────────── */

/**
 * Flat shape returned by `unwrapPagination`. `data` is the row array
 * (no more `response.data.data`); the rest is paginator metadata, camelCased.
 */
export interface Pagination<T> {
  data: T[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Unwraps a paginator response into a single-level object with camelCase keys.
 * Spread inside a list hook so callers consume `data` directly and read
 * `total`/`lastPage`/... without diving into the raw response.
 *
 *   const { data: raw, ...rest } = useQuery<PaginatedResponse<User>>({...});
 *   return { ...rest, ...unwrapPagination(raw) };
 */
export function unwrapPagination<T>(response: PaginatedResponse<T> | undefined): Pagination<T> {
  if (!response) {
    return {
      data: [],
      total: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 0,
      from: 0,
      to: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }

  const meta = (response as unknown as { meta?: Partial<PaginatedResponse<T>> }).meta;
  const links = (response as unknown as { links?: { next?: string | null; prev?: string | null } }).links;
  const src = { ...response, ...(meta ?? {}) } as PaginatedResponse<T>;

  const nextUrl = links?.next ?? response.next_page_url ?? null;
  const prevUrl = links?.prev ?? response.prev_page_url ?? null;

  return {
    data: response.data ?? [],
    total: src.total ?? 0,
    currentPage: src.current_page ?? 1,
    lastPage: src.last_page ?? 1,
    perPage: src.per_page ?? 0,
    from: src.from ?? 0,
    to: src.to ?? 0,
    hasNextPage: nextUrl !== null,
    hasPrevPage: prevUrl !== null,
  };
}

/* ─── Return type for list hooks ────────────────────────────── */

/** Shape returned by list hooks: React Query state + flat pagination fields. */
export type PaginatedQuery<T> = Pagination<T> & {
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  error: unknown;
  refetch: () => void;
};
