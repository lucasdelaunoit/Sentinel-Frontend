import { useMutation, useQueryClient } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

interface CreateSkillCategoryPayload {
  name: string;
}

export default function useCreateSkillCategory() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name }: CreateSkillCategoryPayload) =>
      privateApi.post("/api/skill-categories", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
    },
  });
}
