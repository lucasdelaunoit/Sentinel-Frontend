import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetCompanyHolidaysForMonth(month: Date) {
  const privateApi = usePrivateApi();
  const year = month.getFullYear();
  const monthIndex = month.getMonth() + 1;

  const { data, ...rest } = useQuery<{ data: CompanyHoliday[] }>({
    queryKey: ["company-holidays", "month", year, monthIndex],
    queryFn: async () => {
      const res = await privateApi.get<{ data: CompanyHoliday[] }>(
        `/api/settings/holidays/month?year=${year}&month=${monthIndex}`,
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, data: data?.data ?? [] };
}
