import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";

export default function useGetProjectUsers(
  projectId: string | number | undefined,
  params: QueryParams = {},
) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<UserListItem>>({
    queryKey: ["projects", projectId, "users", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<UserListItem>>(
        `/api/projects/${projectId}/users${queryString}`,
      );
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
