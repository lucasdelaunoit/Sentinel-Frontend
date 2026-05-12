import { useMutation, useQueryClient } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useCreateSkill() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, skill_category_id }: CreateSkillRequest) =>
      privateApi.post("/api/skills", { name, skill_category_id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
    },
  });
}
