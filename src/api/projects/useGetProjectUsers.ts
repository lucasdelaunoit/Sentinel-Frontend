import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import useLaravelQuery from "@/hooks/useLaravelQuery";
import type { UserListItem } from "@/types/dashboard";
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel";

export default function useGetProjectUsers(
  projectId: string | number | undefined,
  params: LaravelQueryParams = {},
) {
  const privateApi = usePrivateApi();
  const queryString = useLaravelQuery(params);

  return useQuery<LaravelPaginatedResponse<UserListItem>>({
    queryKey: ["projects", projectId, "users", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<UserListItem>>(
        `/api/projects/${projectId}/users${queryString}`,
      );
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
