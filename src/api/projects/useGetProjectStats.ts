import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetProjectStats(projectId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<ProjectStats>({
    queryKey: ["projects", projectId, "stats"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectStats>(`/api/projects/${projectId}/stats`);
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
