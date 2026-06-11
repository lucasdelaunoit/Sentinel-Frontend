import createMutationHook from "@/api/createMutationHook";

interface UpdateSkillCategoryPayload {
  id: number;
  name: string;
}

const useUpdateSkillCategory = createMutationHook(
  "updateSkillCategory",
  {
    mutationFn: (api, { id, name }: UpdateSkillCategoryPayload) =>
      api.patch(`/api/settings/skill-categories/${id}`, { name }),
    invalidateKeys: () => [["skill-categories"]],
    successMessage: ({ name }) => `Category renamed to "${name}".`,
    errorMessage: "Failed to update category.",
  },
);

export default useUpdateSkillCategory;
