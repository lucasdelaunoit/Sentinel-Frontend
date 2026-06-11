import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetProjectFragilityAlerts(projectId: string | undefined) {

  return useQuery<ProjectFragilityAlert[]>({
    queryKey: ["projects", projectId, "fragility-alerts"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectFragilityAlertsResponse>(
        `/api/projects/${projectId}/fragility-alerts`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
