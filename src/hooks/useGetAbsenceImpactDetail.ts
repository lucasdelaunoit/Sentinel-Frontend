import { useQuery } from "@tanstack/react-query"
import usePrivateApi from "@/api/privateApi"
import type { AbsenceImpactDetail } from "@/types/dashboard"

export default function useGetAbsenceImpactDetail() {
  const privateApi = usePrivateApi()

  return useQuery<AbsenceImpactDetail>({
    queryKey: ["dashboard", "stats", "absence-impact"],
    queryFn: async () => {
      const { data } = await privateApi.get<AbsenceImpactDetail>("/api/dashboard/stats/absence-impact")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
