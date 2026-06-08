import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
    projects: [],
  };
}

/**
 * Debounced live simulation of pending absences. Re-fires on every change to the
 * absence set and reflects the latest result — never call the mutation by hand.
 */
export default function useSimulatePlanning(
  absences: SimulateAbsenceInput[],
  isValid: boolean,
  options: UseSimulatePlanningOptions = {},
) {
  const { debounceMs = 300 } = options;
  const privateApi = usePrivateApi();
  const month = absences[0]?.start_date.slice(0, 7) ?? "1970-01";
  const emptyResult = useMemo(() => buildEmpty(month), [month]);

  const mutation = useMutation({
    mutationFn: async (input: SimulateAbsenceInput[]) => {
      const { data } = await privateApi.post<SimulateResponse>("/api/planning/simulate", { absences: input });
      return data;
    },
  });

  const { mutate, reset } = mutation;
  const signature = JSON.stringify(absences);

  // True from the instant the absence set changes (debounce start) until its
  // request settles — not just while the request is in flight. `genRef` guards
  // against a stale in-flight request clearing the loading state of a newer one.
  const [isLoading, setIsLoading] = useState(false);
  const genRef = useRef(0);

  useEffect(() => {
    if (absences.length === 0 || !isValid) {
      reset();
      setIsLoading(false);
      return;
    }
    const gen = ++genRef.current;
    setIsLoading(true);
    const timer = window.setTimeout(() => {
      mutate(absences, {
        onSettled: () => {
          if (genRef.current === gen) setIsLoading(false);
        },
      });
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [signature, isValid, debounceMs]);

  const status: SimulateStatus =
    !isValid && absences.length > 0
      ? "error"
      : isLoading
        ? "pending"
        : mutation.isError
          ? "error"
          : mutation.isSuccess
            ? "saved"
            : "idle";

  return {
    data: mutation.data ?? emptyResult,
    status,
    isLoading,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
