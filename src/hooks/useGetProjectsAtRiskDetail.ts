import { useQuery } from "@tanstack/react-query"
import usePrivateApi from "@/api/privateApi"
import type { ProjectsAtRiskDetail } from "@/types/dashboard"

export default function useGetProjectsAtRiskDetail() {
  const privateApi = usePrivateApi()

  return useQuery<ProjectsAtRiskDetail>({
    queryKey: ["dashboard", "stats", "projects-at-risk"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectsAtRiskDetail>("/api/dashboard/stats/projects-at-risk")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
