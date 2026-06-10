import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface ReopenProjectArgs {
  id: number;
  name?: string;
}

export default function useReopenProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id }: ReopenProjectArgs) => privateApi.post(`/api/projects/${id}/reopen`),
    onSuccess: (_, { id, name }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(name ? `Project "${name}" reopened.` : "Project reopened.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to reopen project."));
    },
  });

  return {
    reopenProject: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
