import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

/**
 * Project-wide coverage summary (covered / silo / uncovered / total) computed over ALL
 * required skills server-side — independent of which list page is shown, so the totals
 * stay exact even though the coverage table is paginated.
 */
export default function useGetProjectCoverageSummary(projectId: string | undefined) {

  return useQuery<ProjectKnowledgeCoverageSummary>({
    // "knowledge-coverage" prefix so skill mutations invalidate this alongside the list.
    queryKey: ["projects", projectId, "knowledge-coverage", "summary"],
    queryFn: async () => {
      const { data } = await axiosClient.get<{ data: ProjectKnowledgeCoverageSummary }>(
        `/api/projects/${projectId}/knowledge-coverage/summary`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
