/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query";

/* -------- /Custom hooks/ -------- */
import { axiosClient } from "@/lib/api/client";

/* -------- /Types/ -------- */

/* ------------------- (Hook) ------------------ */

/**
 * useGetUsersStats - Fetches the employees page stat cards payload.
 *
 * Returns values, insight strings, and severities for the four executive
 * cards (Total Employees, Critical Employees, Skill Coverage, Department Balance).
 *
 * @returns React Query result wrapping `UsersStats`
 */
export default function useGetUsersStats() {

  return useQuery<UsersStats>({
    queryKey: ["users", "stats"],
    queryFn: async () => {
      const { data } = await axiosClient.get<UsersStats>("/api/users/stats");
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
