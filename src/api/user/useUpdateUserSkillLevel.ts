import { createMutationHook } from "@/lib/api/createMutationHook";

interface UpdateLevelArgs {
  userId: string | number;
  skillId: number;
  level: number;
}

const useUpdateUserSkillLevel = createMutationHook(
  "updateUserSkillLevel",
  {
    mutationFn: (api, { userId, skillId, level }: UpdateLevelArgs) =>
      api.patch(`/api/users/${userId}/skills/${skillId}`, { level }),
    invalidateKeys: ({ userId }) => [
      ["users", String(userId), "skills"],
      ["users", String(userId), "competency-radar"],
      ["users", String(userId)],
      ["users"],
    ],
    errorMessage: "Failed to update skill level.",
  },
);

export default useUpdateUserSkillLevel;
