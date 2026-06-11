import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

export default function useGetUsers<T = User>(params: QueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<T>>({
    queryKey: ["users", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<T>>(`/api/users${queryString}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
