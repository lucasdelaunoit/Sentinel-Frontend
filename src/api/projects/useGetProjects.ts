import { useQuery } from "@tanstack/react-query"
import usePrivateApi from "@/api/privateApi.ts"
import useLaravelQuery from "@/hooks/useLaravelQuery"
import type { ProjectListItem } from "@/types/dashboard"
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel"

export default function useGetProjects(params: LaravelQueryParams = {}, enabled = true) {
  const privateApi = usePrivateApi()
  const queryString = useLaravelQuery(params)

  return useQuery<LaravelPaginatedResponse<ProjectListItem>>({
    queryKey: ["projects", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<ProjectListItem>>(`/api/projects${queryString}`)
      return data
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
