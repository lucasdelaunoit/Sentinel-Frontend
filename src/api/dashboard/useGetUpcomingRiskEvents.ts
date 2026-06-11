import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import type { UpcomingRiskEventsResponse } from "@/types/dashboard";

export default function useGetUpcomingRiskEvents(horizonDays = 30) {

  return useQuery<UpcomingRiskEventsResponse>({
    queryKey: ["dashboard", "upcoming-risk-events", horizonDays],
    queryFn: async () => {
      const { data } = await axiosClient.get<UpcomingRiskEventsResponse>(
        "/api/dashboard/upcoming-risk-events",
        { params: { horizon_days: horizonDays } },
      );
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
