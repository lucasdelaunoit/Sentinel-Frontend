import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface CompleteProjectArgs {
  id: number;
  name?: string;
}

export default function useCompleteProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: CompleteProjectArgs) => privateApi.post(`/api/projects/${id}/complete`),
    onSuccess: (_, { id, name }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(name ? `Project "${name}" completed.` : "Project completed.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to complete project."));
    },
  });
}
