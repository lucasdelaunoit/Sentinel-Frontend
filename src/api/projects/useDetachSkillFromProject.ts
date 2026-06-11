import { createMutationHook } from "@/lib/api/createMutationHook";

interface DetachProjectSkillArgs {
  projectId: string | number;
  skillId: number;
}

const useDetachSkillFromProject = createMutationHook(
  "detachSkillFromProject",
  {
    mutationFn: (api, { projectId, skillId }: DetachProjectSkillArgs) =>
      api.delete(`/api/projects/${projectId}/skills/${skillId}`),
    invalidateKeys: ({ projectId }) => [
      ["projects", projectId, "knowledge-coverage"],
      ["projects", projectId, "competency-radar"],
      ["projects", String(projectId)],
      ["projects-stats"],
    ],
    successMessage: "Required skill removed.",
    errorMessage: "Failed to remove required skill.",
  },
);

export default useDetachSkillFromProject;
