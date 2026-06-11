import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetPlanning(month: string) {

  return useQuery<PlanningResponse>({
    queryKey: ["planning", month],
    queryFn: async () => {
      const { data } = await axiosClient.get<PlanningResponse>(`/api/planning?month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
