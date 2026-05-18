import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useDeleteRule() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => privateApi.delete(`/api/rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["rule-violations"] });
      toast.success("Rule deleted.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to delete rule."));
    },
  });
}
