import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface UnarchiveProjectArgs {
  id: number;
  name?: string;
}

export default function useUnarchiveProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: UnarchiveProjectArgs) => privateApi.post(`/api/projects/${id}/unarchive`),
    onSuccess: (_, { id, name }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(name ? `Project "${name}" unarchived.` : "Project unarchived.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to unarchive project."));
    },
  });
}
