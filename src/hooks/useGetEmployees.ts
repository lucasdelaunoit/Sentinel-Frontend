import { useQuery } from "@tanstack/react-query"
import usePrivateApi from "@/api/privateApi"
import type { EmployeeListItem } from "@/types/dashboard"

export default function useGetEmployees(enabled = false) {
  const privateApi = usePrivateApi()

  return useQuery<EmployeeListItem[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await privateApi.get<EmployeeListItem[]>("/api/employees")
      return data
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
