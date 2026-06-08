import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useGetPlanningCapacity(month: string) {
  const privateApi = usePrivateApi();

  return useQuery<PlanningCapacityResponse>({
    queryKey: ["planning", month, "capacity"],
    queryFn: async () => {
      const { data } = await privateApi.get<PlanningCapacityResponse>(`/api/planning/capacity?month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
