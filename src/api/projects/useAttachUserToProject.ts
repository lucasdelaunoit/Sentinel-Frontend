import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface AttachUserArgs {
  projectId: string | number;
  userId: number;
}

export default function useAttachUserToProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ projectId, userId }: AttachUserArgs) =>
      privateApi.post(`/api/projects/${projectId}/users`, { user_id: userId }),
    onSuccess: (_, { projectId, userId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "users"] });
      queryClient.invalidateQueries({ queryKey: ["projects", String(projectId)] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId), "projects"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(userId), "stats"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to add member."));
    },
  });

  return {
    attachUserToProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
