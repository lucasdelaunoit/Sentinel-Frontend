import createMutationHook from "@/api/createMutationHook";

interface UpdateRuleArgs {
  id: number;
  payload: UpdateRuleRequest;
}

const useUpdateRule = createMutationHook(
  "updateRule",
  {
    mutationFn: (api, { id, payload }: UpdateRuleArgs) =>
      api.patch<Rule>(`/api/settings/rules/${id}`, payload),
    invalidateKeys: () => [["rules"], ["rule-violations"]],
    successMessage: "Rule updated.",
    errorMessage: "Failed to update rule.",
  },
);

export default useUpdateRule;
