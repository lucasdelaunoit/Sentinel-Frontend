import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface AddProjectSkillArgs {
  projectId: string | number;
  skillId: number;
  requiredLevel: number;
}

export default function useAddProjectSkillRequirement() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ projectId, skillId, requiredLevel }: AddProjectSkillArgs) =>
      privateApi.post(`/api/projects/${projectId}/skills`, {
        skill_id: skillId,
        required_level: requiredLevel,
      } satisfies AddProjectSkillRequest),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "knowledge-coverage"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "competency-radar"] });
      queryClient.invalidateQueries({ queryKey: ["projects", String(projectId)] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to add required skill."));
    },
  });

  return {
    addProjectSkillRequirement: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
