import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import type { UserSkillDetail } from "@/types/dashboard";

export default function useGetUserSkills(userId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<UserSkillDetail[]>({
    queryKey: ["users", userId, "skills"],
    queryFn: async () => {
      const { data } = await privateApi.get<UserSkillDetail[]>(`/api/users/${userId}/skills`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
