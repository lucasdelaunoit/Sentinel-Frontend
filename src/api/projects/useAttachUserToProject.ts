import { createMutationHook } from "@/lib/api/createMutationHook";

interface AttachUserArgs {
  projectId: string | number;
  userId: number;
}

const useAttachUserToProject = createMutationHook(
  "attachUserToProject",
  {
    mutationFn: (api, { projectId, userId }: AttachUserArgs) =>
      api.post(`/api/projects/${projectId}/users`, { user_id: userId }),
    invalidateKeys: ({ projectId, userId }) => [
      ["projects", projectId, "users"],
      ["projects", String(projectId)],
      ["projects-stats"],
      ["users", String(userId), "projects"],
      ["users", String(userId), "stats"],
    ],
    errorMessage: "Failed to add member.",
  },
);

export default useAttachUserToProject;
