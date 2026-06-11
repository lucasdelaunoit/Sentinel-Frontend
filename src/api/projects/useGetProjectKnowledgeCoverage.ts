import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";

/**
 * Paginated, searchable, sortable, filterable knowledge-coverage rows for a project.
 * Each row carries its first 5 holders plus `holders_total`; the full holder list is
 * fetched on demand via `useGetSkillHolders`. Counts/totals must NOT be derived from a
 * page — read project-wide aggregates from `useGetProjectCoverageSummary`.
 */
export default function useGetProjectKnowledgeCoverage(projectId: string | undefined, params: QueryParams = {}) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<ProjectKnowledgeCoverageItem>>({
    queryKey: ["projects", projectId, "knowledge-coverage", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<ProjectKnowledgeCoverageItem>>(
        `/api/projects/${projectId}/knowledge-coverage${queryString}`,
      );
      return data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
