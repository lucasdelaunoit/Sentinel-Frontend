import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";

interface UpdateSkillCategoryPayload {
  id: number;
  name: string;
}

export default function useUpdateSkillCategory() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: UpdateSkillCategoryPayload) => privateApi.put(`/api/skill-categories/${id}`, { name }),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success(`Category renamed to "${name}".`);
    },
    onError: () => {
      toast.error("Failed to update category.");
    },
  });
}
