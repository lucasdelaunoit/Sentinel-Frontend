import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useUpdateSkill() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, skill_category_id }: UpdateSkillRequest) =>
      privateApi.patch(`/api/settings/skills/${id}`, { name, skill_category_id }),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skill-categories"] });
      toast.success(`Skill "${name}" updated.`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update skill."));
    },
  });
}
