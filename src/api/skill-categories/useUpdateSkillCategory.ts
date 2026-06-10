import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface UpdateSkillCategoryPayload {
  id: number;
  name: string;
}

export default function useUpdateSkillCategory() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, name }: UpdateSkillCategoryPayload) =>
      privateApi.patch(`/api/settings/skill-categories/${id}`, { name }),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success(`Category renamed to "${name}".`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update category."));
    },
  });

  return {
    updateSkillCategory: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
