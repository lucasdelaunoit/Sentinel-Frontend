import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetProjectMetrics(projectId: string | undefined) {

  return useQuery<ProjectMetrics>({
    queryKey: ["projects", projectId, "metrics"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectMetrics>(`/api/projects/${projectId}/metrics`);
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
