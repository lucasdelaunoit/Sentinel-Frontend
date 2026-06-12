import { createMutationHook } from "@/lib/api/createMutationHook";

const useTriggerFullRecalculation = createMutationHook("triggerFullRecalculation", {
  mutationFn: (api, _vars: void) => api.post("/api/dashboard/recalculate"),
  successMessage: "Full recalculation queued.",
  errorMessage: "Failed to queue recalculation.",
});

export default useTriggerFullRecalculation;
