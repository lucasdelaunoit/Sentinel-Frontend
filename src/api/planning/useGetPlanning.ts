import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useGetPlanning(month: string) {
  const privateApi = usePrivateApi();

  return useQuery<PlanningResponse>({
    queryKey: ["planning", month],
    queryFn: async () => {
      const { data } = await privateApi.get<PlanningResponse>(`/api/planning?month=${month}`);
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
