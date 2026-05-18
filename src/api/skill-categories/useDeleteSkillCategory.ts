import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useDeleteSkillCategory() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => privateApi.delete(`/api/settings/skill-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success("Category deleted.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to delete category."));
    },
  });
}
