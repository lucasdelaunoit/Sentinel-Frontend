import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useDeleteSkill() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => privateApi.delete(`/api/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success("Skill deleted.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to delete skill."));
    },
  });
}
