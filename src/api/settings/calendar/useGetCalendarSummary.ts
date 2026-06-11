import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetCalendarSummary(year: number, month: number) {

  return useQuery<CalendarSummary>({
    queryKey: ["calendar-summary", year, month],
    queryFn: async () => {
      const { data } = await axiosClient.get<CalendarSummary>(`/api/settings/calendar?year=${year}&month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
