import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";
import { PLANNING_MOCK_ENABLED, fetchPlanningCapacityMock } from "./mock";

export default function useGetPlanningCapacity(month: string) {
  const privateApi = usePrivateApi();

  return useQuery<PlanningCapacityResponse>({
    queryKey: ["planning", month, "capacity"],
    queryFn: async () => {
      if (PLANNING_MOCK_ENABLED) return fetchPlanningCapacityMock(month);
      const { data } = await privateApi.get<PlanningCapacityResponse>(`/api/planning/capacity?month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
