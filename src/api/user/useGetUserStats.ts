/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query";

/* -------- /Custom hooks/ -------- */
import { axiosClient } from "@/lib/api/client";

/* -------- /Types/ -------- */

/* ------------------- (Hook) ------------------ */

export default function useGetUserStats(userId: string | undefined) {

  return useQuery<UserStats>({
    queryKey: ["users", userId, "stats"],
    queryFn: async () => {
      const { data } = await axiosClient.get<UserStats>(`/api/users/${userId}/stats`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
