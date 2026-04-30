/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query"

/* -------- /Custom hooks/ -------- */
import usePrivateApi from "@/api/privateApi.ts"

/* -------- /Types/ -------- */
import type { EmployeeTodayStatus } from "@/types/dashboard"

/* ------------------- (Hook) ------------------ */

export default function useGetTeamToday() {
  const privateApi = usePrivateApi()

  return useQuery<EmployeeTodayStatus[]>({
    queryKey: ["employees", "today"],
    queryFn: async () => {
      const { data } = await privateApi.get<EmployeeTodayStatus[]>("/api/employees/today")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
