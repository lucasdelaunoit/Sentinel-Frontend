import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface CreateSkillCategoryPayload {
  name: string;
}

export default function useCreateSkillCategory() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ name }: CreateSkillCategoryPayload) => privateApi.post("/api/settings/skill-categories", { name }),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success(`Category "${name}" created.`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to create category."));
    },
  });

  return {
    createSkillCategory: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
