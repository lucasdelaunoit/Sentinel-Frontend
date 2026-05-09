import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import useLaravelQuery from "@/hooks/useLaravelQuery";
import type { UserProjectItem } from "@/types/dashboard";
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel";

export default function useGetUserProjects(userId: string | undefined, params: LaravelQueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useLaravelQuery(params);

  return useQuery<LaravelPaginatedResponse<UserProjectItem>>({
    queryKey: ["users", userId, "projects", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<UserProjectItem>>(
        `/api/users/${userId}/projects${queryString}`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
