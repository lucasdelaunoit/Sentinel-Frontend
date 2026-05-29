import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface DetachSkillArgs {
  userId: string | number;
  skillId: number;
}

export default function useDetachSkillFromUser() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, skillId }: DetachSkillArgs) =>
      privateApi.delete(`/api/users/${userId}/skills/${skillId}`),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", String(userId), "skills"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId), "competency-radar"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId)] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to remove skill."));
    },
  });

  return {
    detachSkillFromUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
