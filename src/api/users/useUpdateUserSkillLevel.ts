import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface UpdateLevelArgs {
  userId: string | number;
  skillId: number;
  level: number;
}

export default function useUpdateUserSkillLevel() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, skillId, level }: UpdateLevelArgs) =>
      privateApi.patch(`/api/users/${userId}/skills/${skillId}`, { level }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", String(userId), "skills"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId), "competency-radar"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId)] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update skill level."));
    },
  });

  return {
    updateUserSkillLevel: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
