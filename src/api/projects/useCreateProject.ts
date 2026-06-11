import { createMutationHook } from "@/lib/api/createMutationHook";

const useCreateProject = createMutationHook(
  "createProject",
  {
    mutationFn: (api, payload: CreateProjectRequest) => api.post("/api/projects", payload),
    invalidateKeys: () => [["projects"], ["projects-stats"]],
    successMessage: ({ name }) => `Project "${name}" created.`,
    errorMessage: "Failed to create project.",
  },
);

export default useCreateProject;
