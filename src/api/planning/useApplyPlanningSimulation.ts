import { createMutationHook } from "@/lib/api/createMutationHook";

interface ApplyPayload {
  absences: ApplyAbsenceInput[];
}

const useApplyPlanningSimulation = createMutationHook(
  "applyPlanningSimulation",
  {
    mutationFn: async (api, payload: ApplyPayload) => {
      const { data } = await api.post<{ applied: number }>("/api/planning/apply", payload);
      return data;
    },
    invalidateKeys: () => [["planning"], ["users"]],
    successMessage: (_vars, { applied }) =>
      `Scenario saved · ${applied} absence${applied === 1 ? "" : "s"} planned.`,
    errorMessage: "Failed to save scenario.",
  },
);

export default useApplyPlanningSimulation;
