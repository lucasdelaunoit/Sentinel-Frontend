import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetProjectCompetencyRadar(projectId: string | undefined) {

  return useQuery<CompetencyRadarItem[]>({
    queryKey: ["projects", projectId, "competency-radar"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectCompetencyRadarResponse>(
        `/api/projects/${projectId}/competency-radar`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
