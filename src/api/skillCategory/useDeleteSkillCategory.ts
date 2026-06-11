import { createMutationHook } from "@/lib/api/createMutationHook";

const useDeleteSkillCategory = createMutationHook(
  "deleteSkillCategory",
  {
    mutationFn: (api, id: number) => api.delete(`/api/settings/skill-categories/${id}`),
    invalidateKeys: () => [["skill-categories"], ["skills"]],
    successMessage: "Category deleted.",
    errorMessage: "Failed to delete category.",
  },
);

export default useDeleteSkillCategory;
