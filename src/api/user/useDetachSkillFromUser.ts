import { createMutationHook } from "@/lib/api/createMutationHook";

interface DetachSkillArgs {
  userId: string | number;
  skillId: number;
}

const useDetachSkillFromUser = createMutationHook(
  "detachSkillFromUser",
  {
    mutationFn: (api, { userId, skillId }: DetachSkillArgs) =>
      api.delete(`/api/users/${userId}/skills/${skillId}`),
    invalidateKeys: ({ userId }) => [
      ["users", String(userId), "skills"],
      ["users", String(userId), "competency-radar"],
      ["users", String(userId)],
      ["users"],
    ],
    errorMessage: "Failed to remove skill.",
  },
);

export default useDetachSkillFromUser;
