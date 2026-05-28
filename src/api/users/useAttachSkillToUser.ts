import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface AttachSkillArgs {
  userId: string | number;
  skillId: number;
  level: number;
}

export default function useAttachSkillToUser() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, skillId, level }: AttachSkillArgs) =>
      privateApi.post(`/api/users/${userId}/skills`, { skill_id: skillId, level }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", String(userId), "skills"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId)] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to attach skill."));
    },
  });

  return {
    attachSkillToUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
