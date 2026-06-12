import { createMutationHook } from "@/lib/api/createMutationHook";

interface TriggerProjectRecalculationArgs {
  id: string;
}

const useTriggerProjectRecalculation = createMutationHook("triggerProjectRecalculation", {
  mutationFn: (api, { id }: TriggerProjectRecalculationArgs) => api.post(`/api/projects/${id}/recalculate`),
  successMessage: "Recalculation queued.",
  errorMessage: "Failed to queue recalculation.",
});

export default useTriggerProjectRecalculation;
