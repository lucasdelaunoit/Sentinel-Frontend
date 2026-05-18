import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface UpdateRuleArgs {
  id: number;
  payload: UpdateRuleRequest;
}

export default function useUpdateRule() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateRuleArgs) => privateApi.put<Rule>(`/api/rules/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["rule-violations"] });
      toast.success("Rule updated.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update rule."));
    },
  });
}
