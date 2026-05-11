/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query";

/* -------- /Custom hooks/ -------- */
import usePrivateApi from "@/api/privateApi.ts";

/* -------- /Types/ -------- */
import type { UserStats } from "@/types/dashboard";

/* ------------------- (Hook) ------------------ */

export default function useGetUserStats(userId: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<UserStats>({
    queryKey: ["users", userId, "stats"],
    queryFn: async () => {
      const { data } = await privateApi.get<UserStats>(`/api/users/${userId}/stats`);
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
