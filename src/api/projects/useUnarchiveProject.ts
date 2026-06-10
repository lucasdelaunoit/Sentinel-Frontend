import createMutationHook from "@/api/createMutationHook";

interface UnarchiveProjectArgs {
  id: number;
  name?: string;
}

const useUnarchiveProject = createMutationHook(
  "unarchiveProject",
  {
    mutationFn: (api, { id }: UnarchiveProjectArgs) => api.post(`/api/projects/${id}/unarchive`),
    invalidateKeys: ({ id }) => [["projects"], ["projects-stats"], ["project", id]],
    successMessage: ({ name }) => (name ? `Project "${name}" unarchived.` : "Project unarchived."),
    errorMessage: "Failed to unarchive project.",
  },
);

export default useUnarchiveProject;
