import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";

export default function useGetProjects(params: QueryParams = {}, enabled = true) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<Project>>({
    queryKey: ["projects", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<Project>>(`/api/projects${queryString}`);
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
