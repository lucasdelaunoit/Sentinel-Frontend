import { useEffect, useRef, useState } from "react";
import usePrivateApi from "@/api/privateApi";
import type { SimulateAbsenceInput, SimulateResponse } from "@/types/planning";
import { PLANNING_MOCK_ENABLED, simulatePlanningMock } from "./mock";

export type SimulateStatus = "idle" | "pending" | "saved" | "error";

interface UseSimulatePlanningOptions {
  debounceMs?: number;
}

const EMPTY_RESULT: SimulateResponse = { overall_level: "safe", projects: [], per_user_impact: {} };

export default function useSimulatePlanning(
  absences: SimulateAbsenceInput[],
  isValid: boolean,
  options: UseSimulatePlanningOptions = {},
) {
  const { debounceMs = 300 } = options;
  const privateApi = usePrivateApi();
  const [data, setData] = useState<SimulateResponse>(EMPTY_RESULT);
  const [status, setStatus] = useState<SimulateStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const reqIdRef = useRef(0);

  const signature = JSON.stringify(absences);

  useEffect(() => {
    if (absences.length === 0) {
      setData(EMPTY_RESULT);
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
