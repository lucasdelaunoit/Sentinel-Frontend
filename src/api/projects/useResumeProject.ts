import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface ResumeProjectArgs {
  id: number;
  name?: string;
}

export default function useResumeProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: ResumeProjectArgs) => privateApi.post(`/api/projects/${id}/resume`),
    onSuccess: (_, { id, name }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success(name ? `Project "${name}" resumed.` : "Project resumed.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to resume project."));
    },
  });
}
