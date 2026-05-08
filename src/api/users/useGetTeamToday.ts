/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query"

/* -------- /Custom hooks/ -------- */
import usePrivateApi from "@/api/privateApi.ts"

/* -------- /Types/ -------- */
import type { TeamTodayStatusResponse } from "@/types/dashboard"

/* ------------------- (Hook) ------------------ */

export default function useGetTeamToday() {
  const privateApi = usePrivateApi()

  return useQuery<TeamTodayStatusResponse>({
    queryKey: ["users", "today"],
    queryFn: async () => {
      const { data } = await privateApi.get<TeamTodayStatusResponse>("/api/users/today")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
