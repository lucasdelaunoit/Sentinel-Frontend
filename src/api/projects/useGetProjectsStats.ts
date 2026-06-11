/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query";

/* -------- /Custom hooks/ -------- */
import { axiosClient } from "@/lib/api/client";

/* ------------------- (Hook) ------------------ */

/**
 * useGetProjectsStats - Fetches the projects page stat cards payload.
 *
 * Returns totals and health metrics for the four executive cards
 * (Total Projects, Avg Health, Fragile, At Risk).
 *
 * @returns React Query result wrapping `ProjectsStats`
 */
export default function useGetProjectsStats() {

  return useQuery<ProjectsStats>({
    queryKey: ["projects", "stats"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectsStats>("/api/projects/stats");
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
