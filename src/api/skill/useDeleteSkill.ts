import { createMutationHook } from "@/lib/api/createMutationHook";

const useDeleteSkill = createMutationHook(
  "deleteSkill",
  {
    mutationFn: (api, id: string) => api.delete(`/api/settings/skills/${id}`),
    invalidateKeys: () => [["skills"], ["skill-categories"]],
    successMessage: "Skill deleted.",
    errorMessage: "Failed to delete skill.",
  },
);

export default useDeleteSkill;
