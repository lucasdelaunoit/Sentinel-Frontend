import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

/**
 * Paginated, searchable, sortable, filterable knowledge-coverage rows for a project.
 * Each row carries its first 5 holders plus `holders_total`; the full holder list is
 * fetched on demand via `useGetSkillHolders`. Counts/totals must NOT be derived from a
 * page — read project-wide aggregates from `useGetProjectCoverageSummary`.
 */
export default function useGetProjectKnowledgeCoverage(projectId: string | undefined, params: QueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<ProjectKnowledgeCoverageItem>>({
    queryKey: ["projects", projectId, "knowledge-coverage", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<ProjectKnowledgeCoverageItem>>(
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
