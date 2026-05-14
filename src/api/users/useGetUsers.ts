import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import useLaravelQuery from "@/hooks/useLaravelQuery";
import type { UserListItem } from "@/types/dashboard";
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel";

export default function useGetUsers(params: LaravelQueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useLaravelQuery(params);

  return useQuery<LaravelPaginatedResponse<UserListItem>>({
    queryKey: ["users", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<UserListItem>>(`/api/users${queryString}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
