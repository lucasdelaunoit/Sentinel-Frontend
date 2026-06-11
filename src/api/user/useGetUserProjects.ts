import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";

export default function useGetUserProjects(userId: string | undefined, params: QueryParams = {}) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<Project>>({
    queryKey: ["users", userId, "projects", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<Project>>(
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
