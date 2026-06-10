import createMutationHook from "@/api/createMutationHook";

const useCreateRule = createMutationHook(
  "createRule",
  {
    mutationFn: (api, payload: CreateRuleRequest) => api.post<Rule>("/api/settings/rules", payload),
    invalidateKeys: () => [["rules"], ["rule-violations"]],
    successMessage: ({ name }) => `Rule "${name}" created.`,
    errorMessage: "Failed to create rule.",
  },
);

export default useCreateRule;
