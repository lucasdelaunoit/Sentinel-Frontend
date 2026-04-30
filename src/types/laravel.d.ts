export interface LaravelSort {
  field: string
  direction: "asc" | "desc"
}

export interface LaravelFilter {
  field: string
  value: string | number | boolean | string[]
}

export interface LaravelQueryParams {
  page?: number
  per_page?: number
  search?: string
  filters?: LaravelFilter[]
  sorts?: LaravelSort[]
  includes?: string[]
}

export interface LaravelPaginatedResponse<T> {
  current_page: number
  data: T[]
  first_page_url: string
  from: number
  last_page: number
  last_page_url: string
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number
  total: number
}
