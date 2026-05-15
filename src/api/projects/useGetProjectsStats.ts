/* ------------------- (Imports) ------------------ */

/* -------- /External libraries/ -------- */
import { useQuery } from "@tanstack/react-query";

/* -------- /Custom hooks/ -------- */
import usePrivateApi from "@/api/privateApi.ts";

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
  const privateApi = usePrivateApi();

  return useQuery<ProjectsStats>({
    queryKey: ["projects", "stats"],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectsStats>("/api/projects/stats");
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
