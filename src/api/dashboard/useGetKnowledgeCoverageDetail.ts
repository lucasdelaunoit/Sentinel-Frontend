import { useQuery } from "@tanstack/react-query"
import { axiosClient } from "@/lib/api/client";

export default function useGetKnowledgeCoverageDetail() {

  return useQuery<KnowledgeCoverageDetail>({
    queryKey: ["dashboard", "knowledge-coverage"],
    queryFn: async () => {
      const { data } = await axiosClient.get<KnowledgeCoverageDetail>("/api/dashboard/knowledge-coverage")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
