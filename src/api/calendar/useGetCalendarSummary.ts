import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useGetCalendarSummary(year: number, month: number) {
  const privateApi = usePrivateApi();

  return useQuery<CalendarSummary>({
    queryKey: ["calendar-summary", year, month],
    queryFn: async () => {
      const { data } = await privateApi.get<CalendarSummary>(`/api/settings/calendar?year=${year}&month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
