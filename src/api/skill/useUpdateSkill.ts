import createMutationHook from "@/api/createMutationHook";

const useUpdateSkill = createMutationHook(
  "updateSkill",
  {
    mutationFn: (api, { id, name, skill_category_id }: UpdateSkillRequest) =>
      api.patch(`/api/settings/skills/${id}`, { name, skill_category_id }),
    invalidateKeys: () => [["skills"], ["skill-categories"]],
    successMessage: ({ name }) => `Skill "${name}" updated.`,
    errorMessage: "Failed to update skill.",
  },
);

export default useUpdateSkill;
