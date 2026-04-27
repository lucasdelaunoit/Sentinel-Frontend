import { useQuery } from "@tanstack/react-query"
import usePrivateApi from "@/api/privateApi"
import type { KnowledgeCoverageDetail } from "@/types/dashboard"

export default function useGetKnowledgeCoverageDetail() {
  const privateApi = usePrivateApi()

  return useQuery<KnowledgeCoverageDetail>({
    queryKey: ["dashboard", "stats", "knowledge-coverage"],
    queryFn: async () => {
      const { data } = await privateApi.get<KnowledgeCoverageDetail>("/api/dashboard/stats/knowledge-coverage")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
