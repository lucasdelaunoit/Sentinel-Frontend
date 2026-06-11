import { createMutationHook } from "@/lib/api/createMutationHook";

interface CompleteProjectArgs {
  id: number;
  name?: string;
}

const useCompleteProject = createMutationHook(
  "completeProject",
  {
    mutationFn: (api, { id }: CompleteProjectArgs) => api.post(`/api/projects/${id}/complete`),
    invalidateKeys: ({ id }) => [["projects"], ["projects-stats"], ["project", id]],
    successMessage: ({ name }) => (name ? `Project "${name}" completed.` : "Project completed."),
    errorMessage: "Failed to complete project.",
  },
);

export default useCompleteProject;
