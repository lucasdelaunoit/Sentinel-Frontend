import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

export default function useGetUserProjects(userId: string | undefined, params: QueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<Project>>({
    queryKey: ["users", userId, "projects", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<Project>>(
        `/api/users/${userId}/projects${queryString}`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
