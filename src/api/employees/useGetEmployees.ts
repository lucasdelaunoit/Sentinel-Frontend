import { useQuery } from "@tanstack/react-query"
import usePrivateApi from "@/api/privateApi.ts"
import useLaravelQuery from "@/hooks/useLaravelQuery"
import type { EmployeeListItem } from "@/types/dashboard"
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel"

export default function useGetEmployees(params: LaravelQueryParams = {}, enabled = true) {
  const privateApi = usePrivateApi()
  const queryString = useLaravelQuery(params)

  return useQuery<LaravelPaginatedResponse<EmployeeListItem>>({
    queryKey: ["employees", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<EmployeeListItem>>(`/api/employees${queryString}`)
      return data
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
