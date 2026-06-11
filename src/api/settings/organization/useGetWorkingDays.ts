import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

interface WorkingDaysResponse {
  working_days: number[];
}

export default function useGetWorkingDays() {

  return useQuery<WorkingDaysResponse>({
    queryKey: ["working-days"],
    queryFn: async () => {
      const { data } = await axiosClient.get<WorkingDaysResponse | number[]>("/api/settings/workdays");
      return Array.isArray(data) ? { working_days: data } : data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
