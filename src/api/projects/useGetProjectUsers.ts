import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { UserListItem } from "@/types/dashboard";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

export default function useGetProjectUsers(
  projectId: string | number | undefined,
  params: QueryParams = {},
) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<UserListItem>>({
    queryKey: ["projects", projectId, "users", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<UserListItem>>(
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
