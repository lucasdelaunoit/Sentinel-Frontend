import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";
import type { PlanningResponse } from "@/types/planning";
import { PLANNING_MOCK_ENABLED, fetchPlanningMock } from "./mock";

export default function useGetPlanning(month: string) {
  const privateApi = usePrivateApi();

  return useQuery<PlanningResponse>({
    queryKey: ["planning", month],
    queryFn: async () => {
      if (PLANNING_MOCK_ENABLED) return fetchPlanningMock(month);
      const { data } = await privateApi.get<PlanningResponse>(`/api/planning?month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
