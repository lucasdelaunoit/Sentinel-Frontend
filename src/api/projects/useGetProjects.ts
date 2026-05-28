import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

export default function useGetProjects(params: QueryParams = {}, enabled = true) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<Project>>({
    queryKey: ["projects", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<Project>>(`/api/projects${queryString}`);
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
