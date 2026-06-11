import createMutationHook from "@/api/createMutationHook";

interface CreateSkillCategoryPayload {
  name: string;
}

const useCreateSkillCategory = createMutationHook(
  "createSkillCategory",
  {
    mutationFn: (api, { name }: CreateSkillCategoryPayload) =>
      api.post("/api/settings/skill-categories", { name }),
    invalidateKeys: () => [["skill-categories"]],
    successMessage: ({ name }) => `Category "${name}" created.`,
    errorMessage: "Failed to create category.",
  },
);

export default useCreateSkillCategory;
