import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

interface WorkingDaysResponse {
  working_days: number[];
}

export default function useGetWorkingDays() {
  const privateApi = usePrivateApi();

  return useQuery<WorkingDaysResponse>({
    queryKey: ["working-days"],
    queryFn: async () => {
      const { data } = await privateApi.get<WorkingDaysResponse | number[]>("/api/settings/workdays");
      return Array.isArray(data) ? { working_days: data } : data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
