import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetProjectCompetencyRadar(projectId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<ProjectCompetencyRadarItem[]>({
    queryKey: ["projects", projectId, "competency-radar"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectCompetencyRadarResponse>(
        `/api/projects/${projectId}/competency-radar`,
      );
      return data.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
