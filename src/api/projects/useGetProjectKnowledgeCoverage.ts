import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetProjectKnowledgeCoverage(projectId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<ProjectKnowledgeCoverageItem[]>({
    queryKey: ["projects", projectId, "knowledge-coverage"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectKnowledgeCoverageResponse>(
        `/api/projects/${projectId}/knowledge-coverage`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
