import createMutationHook from "@/api/createMutationHook";

const useDeleteRule = createMutationHook(
  "deleteRule",
  {
    mutationFn: (api, id: number) => api.delete(`/api/settings/rules/${id}`),
    invalidateKeys: () => [["rules"], ["rule-violations"]],
    successMessage: "Rule deleted.",
    errorMessage: "Failed to delete rule.",
  },
);

export default useDeleteRule;
