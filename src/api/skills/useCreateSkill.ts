import createMutationHook from "@/api/createMutationHook";

const useCreateSkill = createMutationHook(
  "createSkill",
  {
    mutationFn: (api, { name, skill_category_id }: CreateSkillRequest) =>
      api.post("/api/settings/skills", { name, skill_category_id }),
    invalidateKeys: () => [["skills"], ["skill-categories"]],
    successMessage: ({ name }) => `Skill "${name}" created.`,
    errorMessage: "Failed to create skill.",
  },
);

export default useCreateSkill;
