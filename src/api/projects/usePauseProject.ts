import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface PauseProjectArgs {
  id: number;
  name?: string;
}

export default function usePauseProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: PauseProjectArgs) => privateApi.post(`/api/projects/${id}/pause`),
    onSuccess: (_, { id, name }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(name ? `Project "${name}" paused.` : "Project paused.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to pause project."));
    },
  });
}
