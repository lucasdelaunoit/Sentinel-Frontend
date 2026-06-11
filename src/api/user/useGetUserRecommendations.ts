import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetUserRecommendations(userId: string | undefined) {

  return useQuery<UserRecommendation[]>({
    queryKey: ["users", userId, "recommendations"],
    queryFn: async () => {
      const { data } = await axiosClient.get<UserRecommendation[]>(`/api/users/${userId}/recommendations`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
