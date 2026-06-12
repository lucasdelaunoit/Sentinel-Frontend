import { createMutationHook } from "@/lib/api/createMutationHook";

interface ArchiveProjectArgs {
  id: number;
  name?: string;
}

const useArchiveProject = createMutationHook(
  "archiveProject",
  {
    mutationFn: (api, { id }: ArchiveProjectArgs) => api.post(`/api/projects/${id}/archive`),
    invalidateKeys: () => [["projects"]],
    successMessage: ({ name }) => (name ? `Project "${name}" archived.` : "Project archived."),
    errorMessage: "Failed to archive project.",
  },
);

export default useArchiveProject;
