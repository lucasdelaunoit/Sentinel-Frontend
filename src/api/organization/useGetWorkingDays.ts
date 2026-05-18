import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

interface WorkingDaysResponse {
  working_days: number[];
}

export default function useGetWorkingDays() {
  const privateApi = usePrivateApi();

  return useQuery<WorkingDaysResponse>({
    queryKey: ["working-days"],
    queryFn: async () => {
      const { data } = await privateApi.get<WorkingDaysResponse>("/api/settings/workdays");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
