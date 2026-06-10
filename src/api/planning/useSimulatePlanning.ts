import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export type SimulateStatus = "idle" | "pending" | "saved" | "error";

interface UseSimulatePlanningOptions {
  debounceMs?: number;
}

/** Read-only zero-state returned before any simulation runs. */
const EMPTY_SIMULATION: SimulateResponse = {
  totals: {
    absent_headcount_peak: 0,
    absent_headcount_peak_date: null,
    severity: "ok",
  },
  per_user_impact: {},
  per_project_impact: [],
  per_skill_impact: [],
  per_day_load: [],
  hotspots: [],
  cascading_risks: [],
  warnings: [],
  comparison_vs_baseline: {
    risk_score: { before: 0, after: 0, delta_pct: 0 },
    bus_factor: { before: 0, after: 0 },
    coverage_pct: { before: 100, after: 100 },
    projects_healthy_count: { before: 0, after: 0 },
  },
};

/**
 * Debounced live simulation of pending absences. Modeled as a query: POST /simulate is a pure
 * read (computes risk from an absence set, no side effect), so identical sets dedupe and cache.
 * The query key is the debounced absence signature — drag a block back to a prior position and the
 * cached result returns instantly. Never call this by hand; it tracks the latest set automatically.
 */
export default function useSimulatePlanning(
  absences: SimulateAbsenceInput[],
  isValid: boolean,
  options: UseSimulatePlanningOptions = {},
) {
  const { debounceMs = 300 } = options;
  const privateApi = usePrivateApi();

  const signature = JSON.stringify(absences);
  const [debounced, setDebounced] = useState(absences);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(absences), debounceMs);
    return () => window.clearTimeout(timer);
  }, [signature, debounceMs]);

  const debouncedSignature = JSON.stringify(debounced);
  const enabled = isValid && debounced.length > 0;

  const query = useQuery({
    queryKey: ["planning-simulate", debouncedSignature],
    queryFn: async () => {
      const { data } = await privateApi.post<SimulateResponse>("/api/planning/simulate", { absences: debounced });
      return data;
    },
    enabled,
    staleTime: Infinity,
  });

  const pendingDebounce = enabled && signature !== debouncedSignature;
  const isLoading = pendingDebounce || (enabled && query.isFetching);

  const status: SimulateStatus =
    !isValid && absences.length > 0
      ? "error"
      : isLoading
        ? "pending"
        : query.isError
          ? "error"
          : query.isSuccess
            ? "saved"
            : "idle";

  return {
    data: enabled ? (query.data ?? EMPTY_SIMULATION) : EMPTY_SIMULATION,
    status,
    isLoading,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
  };
}
