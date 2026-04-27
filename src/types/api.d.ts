export type Severity = "critical" | "warning" | "ok"

export interface LaravelPaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}
