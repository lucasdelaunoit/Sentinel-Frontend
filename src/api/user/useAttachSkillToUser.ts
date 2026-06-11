import createMutationHook from "@/api/createMutationHook";

interface AttachSkillArgs {
  userId: string | number;
  skillId: number;
  level: number;
}

const useAttachSkillToUser = createMutationHook(
  "attachSkillToUser",
  {
    mutationFn: (api, { userId, skillId, level }: AttachSkillArgs) =>
      api.post(`/api/users/${userId}/skills`, { skill_id: skillId, level }),
    invalidateKeys: ({ userId }) => [
      ["users", String(userId), "skills"],
      ["users", String(userId), "competency-radar"],
      ["users", String(userId)],
      ["users"],
    ],
    errorMessage: "Failed to attach skill.",
  },
);

export default useAttachSkillToUser;
