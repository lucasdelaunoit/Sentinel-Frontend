import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";
import type { UpcomingRiskEventsResponse } from "@/types/dashboard";

export default function useGetUpcomingRiskEvents(horizonDays = 30) {
  const privateApi = usePrivateApi();

  return useQuery<UpcomingRiskEventsResponse>({
    queryKey: ["dashboard", "upcoming-risk-events", horizonDays],
    queryFn: async () => {
      const { data } = await privateApi.get<UpcomingRiskEventsResponse>(
        "/api/dashboard/upcoming-risk-events",
        { params: { horizon_days: horizonDays } },
      );
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
