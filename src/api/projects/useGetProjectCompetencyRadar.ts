import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export type CompetencyRadarScope = "all" | "required";

export default function useGetProjectCompetencyRadar(
  projectId: string | undefined,
  scope: CompetencyRadarScope = "all",
) {

  return useQuery<CompetencyRadarItem[]>({
    queryKey: ["projects", projectId, "competency-radar", scope],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectCompetencyRadarResponse>(
        `/api/projects/${projectId}/competency-radar?scope=${scope}`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}
