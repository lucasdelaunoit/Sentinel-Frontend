/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query";

/* -------- /Custom hooks/ -------- */
import usePrivateApi from "@/api/privateApi.ts";

/* -------- /Types/ -------- */
import type { EmployeesStats } from "@/types/dashboard";

/* ------------------- (Hook) ------------------ */

/**
 * useGetEmployeesStats - Fetches the employees page stat cards payload.
 *
 * Returns values, insight strings, and severities for the four executive
 * cards (Total Employees, Critical Employees, Skill Coverage, Department Balance).
 *
 * @returns React Query result wrapping `EmployeesStats`
 */
export default function useGetEmployeesStats() {
  const privateApi = usePrivateApi();

  return useQuery<EmployeesStats>({
    queryKey: ["employees", "stats"],
    queryFn: async () => {
      const { data } = await privateApi.get<EmployeesStats>("/api/employees/stats");
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
