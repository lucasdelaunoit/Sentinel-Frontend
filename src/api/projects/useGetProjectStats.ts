import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetProjectStats(projectId: string | undefined) {

  return useQuery<ProjectStats>({
    queryKey: ["projects", projectId, "stats"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectStats>(`/api/projects/${projectId}/stats`);
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
