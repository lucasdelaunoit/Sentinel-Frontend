import { createMutationHook } from "@/lib/api/createMutationHook";

interface PauseProjectArgs {
  id: number;
  name?: string;
}

const usePauseProject = createMutationHook(
  "pauseProject",
  {
    mutationFn: (api, { id }: PauseProjectArgs) => api.post(`/api/projects/${id}/pause`),
    invalidateKeys: ({ id }) => [["projects"], ["projects-stats"], ["project", id]],
    successMessage: ({ name }) => (name ? `Project "${name}" paused.` : "Project paused."),
    errorMessage: "Failed to pause project.",
  },
);

export default usePauseProject;
