import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";

export default function useGetCompanyHolidays(params: QueryParams = {}) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<CompanyHoliday>>({
    queryKey: ["company-holidays", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<CompanyHoliday>>(`/api/settings/holidays${queryString}`);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
