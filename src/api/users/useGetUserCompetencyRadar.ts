import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetUserCompetencyRadar(userId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<CompetencyRadarItem[]>({
    queryKey: ["users", userId, "competency-radar"],
    queryFn: async () => {
      const { data } = await privateApi.get<UserCompetencyRadarResponse>(
        `/api/users/${userId}/competency-radar`,
      );
      return data.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
