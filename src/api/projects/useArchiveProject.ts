import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface ArchiveProjectArgs {
  id: number;
  name?: string;
}

export default function useArchiveProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: ArchiveProjectArgs) => privateApi.post(`/api/projects/${id}/archive`),
    onSuccess: (_, { id, name }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(name ? `Project "${name}" archived.` : "Project archived.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to archive project."));
    },
  });
}
