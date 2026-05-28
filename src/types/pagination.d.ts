export interface SortParam {
  field: string
  direction: "asc" | "desc"
}

export interface FilterParam {
  field: string
  value: string | number | boolean | string[]
}

export interface QueryParams {
  page?: number
  per_page?: number
  search?: string
  filters?: FilterParam[]
  sorts?: SortParam[]
  includes?: string[]
}

export interface PaginatedResponse<T> {
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
