import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import type { UserAbsenceStats } from "@/types/dashboard";

export default function useGetUserAbsenceStats(userId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<UserAbsenceStats>({
    queryKey: ["users", userId, "absences", "stats"],
    queryFn: async () => {
      const { data } = await privateApi.get<UserAbsenceStats>(`/api/users/${userId}/absences/stats`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
