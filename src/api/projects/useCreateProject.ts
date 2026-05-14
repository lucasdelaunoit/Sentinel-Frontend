import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useCreateProject() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => privateApi.post("/api/projects", payload),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects-stats"] });
      toast.success(`Project "${name}" created.`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to create project."));
    },
  });
}
