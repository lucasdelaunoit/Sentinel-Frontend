import { useQuery } from "@tanstack/react-query"
import usePrivateApi from "@/api/privateApi"
import type { TeamAvailabilityDetail } from "@/types/dashboard"

export default function useGetTeamAvailabilityDetail() {
  const privateApi = usePrivateApi()

  return useQuery<TeamAvailabilityDetail>({
    queryKey: ["dashboard", "stats", "team-availability"],
    queryFn: async () => {
      const { data } = await privateApi.get<TeamAvailabilityDetail>("/api/dashboard/stats/team-availability")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
