import { useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import type { LaravelQueryParams } from "@/types/laravel"

export function useLaravelQuery(params: LaravelQueryParams = {}, debounceMs = 350): string {
  const { page, per_page, search, filters, sorts, includes } = params

  const debouncedSearch = useDebounce(search ?? "", debounceMs)

  return useMemo(() => {
    const parts: string[] = []

    if (page !== undefined && page >= 1) parts.push(`page=${page}`)
    if (per_page !== undefined && per_page >= 1 && per_page <= 100) parts.push(`per_page=${per_page}`)
    if (debouncedSearch) parts.push(`search=${encodeURIComponent(debouncedSearch)}`)

    if (filters && filters.length > 0) {
      for (const { field, value } of filters) {
        const encoded = Array.isArray(value)
          ? value.map(v => encodeURIComponent(String(v))).join(",")
          : encodeURIComponent(String(value))
        parts.push(`filter[${field}]=${encoded}`)
      }
    }

    if (sorts && sorts.length > 0) {
      const sortString = sorts.map(s => (s.direction === "desc" ? `-${s.field}` : s.field)).join(",")
      parts.push(`sort=${sortString}`)
    }

    if (includes && includes.length > 0) parts.push(`include=${includes.join(",")}`)

    return parts.length > 0 ? `?${parts.join("&")}` : ""
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, per_page, debouncedSearch, JSON.stringify(filters), JSON.stringify(sorts), JSON.stringify(includes)])
}

export default useLaravelQuery
