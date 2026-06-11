import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetUserCompetencyRadar(userId: string | undefined) {

  return useQuery<CompetencyRadarItem[]>({
    queryKey: ["users", userId, "competency-radar"],
    queryFn: async () => {
      const { data } = await axiosClient.get<UserCompetencyRadarResponse>(
        `/api/users/${userId}/competency-radar`,
      );
      return data.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
