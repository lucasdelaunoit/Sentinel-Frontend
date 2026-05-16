import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";
import type { SimulateAbsenceInput } from "@/types/planning";
import { PLANNING_MOCK_ENABLED } from "./mock";

interface ApplyPayload {
  absences: SimulateAbsenceInput[];
}

export default function useApplyPlanningSimulation() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ApplyPayload) => {
      if (PLANNING_MOCK_ENABLED) {
        await new Promise((r) => setTimeout(r, 400));
        return { applied: payload.absences.length };
      }
      const { data } = await privateApi.post<{ applied: number }>("/api/planning/apply", payload);
      return data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Scenario saved · ${res.applied} absence${res.applied === 1 ? "" : "s"} planned.`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to save scenario."));
    },
  });
}
