import { createMutationHook } from "@/lib/api/createMutationHook";

interface ResumeProjectArgs {
  id: number;
  name?: string;
}

const useResumeProject = createMutationHook(
  "resumeProject",
  {
    mutationFn: (api, { id }: ResumeProjectArgs) => api.post(`/api/projects/${id}/resume`),
    invalidateKeys: () => [["projects"]],
    successMessage: ({ name }) => (name ? `Project "${name}" resumed.` : "Project resumed."),
    errorMessage: "Failed to resume project.",
  },
);

export default useResumeProject;
