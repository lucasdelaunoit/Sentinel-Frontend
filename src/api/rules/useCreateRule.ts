import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useCreateRule() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRuleRequest) => privateApi.post<Rule>("/api/rules", payload),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["rule-violations"] });
      toast.success(`Rule "${name}" created.`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to create rule."));
    },
  });
}
