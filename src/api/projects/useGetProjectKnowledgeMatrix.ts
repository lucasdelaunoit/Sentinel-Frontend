import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

/**
 * Full (unpaginated) knowledge-coverage matrix with complete holder lists. Use for dashboard
 * cards that aggregate across EVERY required skill (today snapshot, current absence impact) —
 * the paginated `useGetProjectKnowledgeCoverage` and its 5-holder cap would give wrong totals.
 */
export default function useGetProjectKnowledgeMatrix(projectId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<ProjectKnowledgeCoverageItem[]>({
    // "knowledge-coverage" prefix so skill mutations invalidate this alongside the list & summary.
    queryKey: ["projects", projectId, "knowledge-coverage", "matrix"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectKnowledgeCoverageResponse>(
        `/api/projects/${projectId}/knowledge-coverage/matrix`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
