import { createMutationHook } from "@/lib/api/createMutationHook";

interface ReopenProjectArgs {
  id: number;
  name?: string;
}

const useReopenProject = createMutationHook(
  "reopenProject",
  {
    mutationFn: (api, { id }: ReopenProjectArgs) => api.post(`/api/projects/${id}/reopen`),
    invalidateKeys: ({ id }) => [["projects"], ["projects-stats"], ["project", id]],
    successMessage: ({ name }) => (name ? `Project "${name}" reopened.` : "Project reopened."),
    errorMessage: "Failed to reopen project.",
  },
);

export default useReopenProject;
