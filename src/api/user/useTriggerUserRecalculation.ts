import { createMutationHook } from "@/lib/api/createMutationHook";

interface TriggerUserRecalculationArgs {
  id: string;
}

const useTriggerUserRecalculation = createMutationHook("triggerUserRecalculation", {
  mutationFn: (api, { id }: TriggerUserRecalculationArgs) => api.post(`/api/users/${id}/recalculate`),
  successMessage: "Recalculation queued.",
  errorMessage: "Failed to queue recalculation.",
});

export default useTriggerUserRecalculation;
