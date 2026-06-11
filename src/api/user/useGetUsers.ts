import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";

export default function useGetUsers<T = User>(params: QueryParams = {}) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<T>>({
    queryKey: ["users", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<T>>(`/api/users${queryString}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
