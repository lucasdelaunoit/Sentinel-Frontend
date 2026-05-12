import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import useLaravelQuery from "@/hooks/useLaravelQuery";
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel";

export default function useGetSkills(params: LaravelQueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useLaravelQuery(params);

  return useQuery<LaravelPaginatedResponse<Skill>>({
    queryKey: ["skills", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<Skill>>(`/api/skills${queryString}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
