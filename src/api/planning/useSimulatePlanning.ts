import { useEffect, useMemo, useRef, useState } from "react";
import usePrivateApi from "@/api/privateApi";
import { PLANNING_MOCK_ENABLED, simulatePlanningMock } from "./mock";

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

export default function useSimulatePlanning(
  absences: SimulateAbsenceInput[],
  isValid: boolean,
  options: UseSimulatePlanningOptions = {},
) {
  const { debounceMs = 300 } = options;
  const privateApi = usePrivateApi();
  const month = absences[0]?.start_date.slice(0, 7) ?? "1970-01";
  const emptyResult = useMemo(() => buildEmpty(month), [month]);
  const [data, setData] = useState<SimulateResponse>(emptyResult);
  const [status, setStatus] = useState<SimulateStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const reqIdRef = useRef(0);

  const signature = JSON.stringify(absences);

  useEffect(() => {
    if (absences.length === 0) {
      setData(emptyResult);
      setStatus("idle");
      return;
    }
    if (!isValid) {
      setStatus("error");
      return;
    }

    setStatus("pending");
    const myReqId = ++reqIdRef.current;

    const timer = window.setTimeout(async () => {
      try {
        const result = PLANNING_MOCK_ENABLED
          ? await simulatePlanningMock(absences)
          : (await privateApi.post<SimulateResponse>("/api/planning/simulate", { absences })).data;
        if (myReqId !== reqIdRef.current) return;
        setData(result);
        setStatus("saved");
        setLastSavedAt(Date.now());
      } catch {
        if (myReqId !== reqIdRef.current) return;
        setStatus("error");
      }
    }, debounceMs);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, isValid, debounceMs]);

  return { data, status, lastSavedAt };
}
