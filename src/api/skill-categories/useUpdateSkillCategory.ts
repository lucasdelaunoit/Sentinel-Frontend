import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
    },
  });
}
