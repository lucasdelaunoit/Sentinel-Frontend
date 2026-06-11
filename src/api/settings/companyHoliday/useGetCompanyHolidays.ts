import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination.ts";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

export default function useGetCompanyHolidays(params: QueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<CompanyHoliday>>({
    queryKey: ["company-holidays", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<CompanyHoliday>>(`/api/settings/holidays${queryString}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
