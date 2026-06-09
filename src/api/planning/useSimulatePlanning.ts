import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export type SimulateStatus = "idle" | "pending" | "saved" | "error";

interface UseSimulatePlanningOptions {
  debounceMs?: number;
}

function buildEmpty(month: string): SimulateResponse {
  return {
    totals: {
      risk_score: 0,
      risk_score_delta: 0,
      bus_factor: 0,
      bus_factor_delta: 0,
      coverage_pct: 100,
      coverage_delta_pct: 0,
      absent_fte_days: 0,
      absent_headcount_peak: 0,
      absent_headcount_peak_date: null,
      org_capacity_loss_pct: 0,
      projects_at_risk_count: 0,
      projects_blocked_count: 0,
      critical_skills_uncovered_count: 0,
      severity: "safe",
    },
    per_user_impact: {},
    per_project_impact: [],
    per_skill_impact: [],
    per_day_load: [],
    hotspots: [],
    skill_concentration_shifts: [],
    cascading_risks: [],
    warnings: [],
    recommendations: [],
    comparison_vs_baseline: {
      risk_score: { before: 0, after: 0, delta_pct: 0 },
      bus_factor: { before: 0, after: 0 },
      coverage_pct: { before: 100, after: 100 },
      projects_healthy_count: { before: 0, after: 0 },
    },
    meta: { computed_at: new Date(0).toISOString(), computation_ms: 0, absences_evaluated: 0, month },
    overall_level: "safe",
  };
}

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
  const month = debounced[0]?.start_date.slice(0, 7) ?? "1970-01";
  const emptyResult = useMemo(() => buildEmpty(month), [month]);

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
    data: enabled ? (query.data ?? emptyResult) : emptyResult,
    status,
    isLoading,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
  };
}
