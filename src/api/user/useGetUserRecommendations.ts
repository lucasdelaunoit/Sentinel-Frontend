import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import type { UserRecommendation } from "@/types/dashboard";

export default function useGetUserRecommendations(userId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<UserRecommendation[]>({
    queryKey: ["users", userId, "recommendations"],
    queryFn: async () => {
      const { data } = await privateApi.get<UserRecommendation[]>(`/api/users/${userId}/recommendations`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
