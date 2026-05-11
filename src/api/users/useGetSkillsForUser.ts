import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import useLaravelQuery from "@/hooks/useLaravelQuery";
import type { UserSkillDetail } from "@/types/dashboard";
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel";

export default function useGetSkillsForUser(
  userId: string | undefined,
  params: LaravelQueryParams = {}
) {
  const privateApi = usePrivateApi();
  const queryString = useLaravelQuery(params);

  return useQuery<LaravelPaginatedResponse<UserSkillDetail>>({
    queryKey: ["users", userId, "skills", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<UserSkillDetail>>(
        `/api/users/${userId}/skills${queryString}`
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
