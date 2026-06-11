/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query"

/* -------- /Custom hooks/ -------- */
import { axiosClient } from "@/lib/api/client";

/* -------- /Types/ -------- */
import type { DashboardStats } from "@/types/dashboard"

/* ------------------- (Hook) ------------------ */

/**
 * useGetDashboardStats - Fetches the live dashboard stat cards payload.
 *
 * Returns values, insight strings, severities, and full modal detail for all
 * four cards (Projects at Risk, Knowledge Coverage, Team Availability, Absence Impact).
 *
 * @returns React Query result wrapping `DashboardStats`
 */
export default function useGetDashboardStats() {

  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await axiosClient.get<DashboardStats>("/api/dashboard/stats")
      return data
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}
