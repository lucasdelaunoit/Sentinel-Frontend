import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetPlanningCapacity(month: string) {

  return useQuery<PlanningCapacityResponse>({
    queryKey: ["planning", month, "capacity"],
    queryFn: async () => {
      const { data } = await axiosClient.get<PlanningCapacityResponse>(`/api/planning/capacity?month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
