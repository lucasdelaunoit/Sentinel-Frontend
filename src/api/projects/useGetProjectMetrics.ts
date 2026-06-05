import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetProjectMetrics(projectId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<ProjectMetrics>({
    queryKey: ["projects", projectId, "metrics"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectMetrics>(`/api/projects/${projectId}/metrics`);
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
