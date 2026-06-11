import { createMutationHook } from "@/lib/api/createMutationHook";

interface AddProjectSkillArgs {
  projectId: string | number;
  skillId: number;
  requiredLevel: number;
}

const useAddProjectSkillRequirement = createMutationHook(
  "addProjectSkillRequirement",
  {
    mutationFn: (api, { projectId, skillId, requiredLevel }: AddProjectSkillArgs) =>
      api.post(`/api/projects/${projectId}/skills`, {
        skill_id: skillId,
        required_level: requiredLevel,
      } satisfies AddProjectSkillRequest),
    invalidateKeys: ({ projectId }) => [
      ["projects", projectId, "knowledge-coverage"],
      ["projects", projectId, "competency-radar"],
      ["projects", String(projectId)],
      ["projects-stats"],
    ],
    errorMessage: "Failed to add required skill.",
  },
);

export default useAddProjectSkillRequirement;
