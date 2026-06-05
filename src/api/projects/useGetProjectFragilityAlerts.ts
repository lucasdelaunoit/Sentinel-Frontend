import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetProjectFragilityAlerts(projectId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<ProjectFragilityAlert[]>({
    queryKey: ["projects", projectId, "fragility-alerts"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectFragilityAlertsResponse>(
        `/api/projects/${projectId}/fragility-alerts`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
