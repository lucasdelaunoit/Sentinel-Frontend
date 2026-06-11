import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetUserAbsenceStats(userId: string | undefined) {

  return useQuery<UserAbsenceStats>({
    queryKey: ["users", userId, "absences", "stats"],
    queryFn: async () => {
      const { data } = await axiosClient.get<UserAbsenceStats>(`/api/users/${userId}/absences/stats`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
