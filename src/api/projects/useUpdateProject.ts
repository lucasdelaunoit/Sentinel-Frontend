import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface UpdateProjectArgs {
  id: string | number;
  payload: UpdateProjectRequest;
}

export default function useUpdateProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, payload }: UpdateProjectArgs) => privateApi.patch(`/api/projects/${id}`, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects", String(id)] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      toast.success("Project updated.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update project."));
    },
  });

  return {
    updateProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
