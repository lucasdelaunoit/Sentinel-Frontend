import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

/**
 * Paginated holders of a single skill within a project — every team member who holds the
 * skill at any level, with their level and today's leave status. Backs the "view all
 * holders" modal opened from a coverage row's "+N" affordance. Disabled until both a
 * project and a skill are selected.
 */
export default function useGetSkillHolders(
  projectId: string | undefined,
  skillId: number | null,
  params: QueryParams = {},
) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<ProjectKnowledgeCoverageHolder>>({
    queryKey: ["projects", projectId, "skills", skillId, "holders", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<ProjectKnowledgeCoverageHolder>>(
        `/api/projects/${projectId}/skills/${skillId}/holders${queryString}`,
      );
      return data;
    },
    enabled: !!projectId && skillId !== null,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
