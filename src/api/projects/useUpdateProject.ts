import createMutationHook from "@/api/createMutationHook";

interface UpdateProjectArgs {
  id: string | number;
  payload: UpdateProjectRequest;
}

const useUpdateProject = createMutationHook(
  "updateProject",
  {
    mutationFn: (api, { id, payload }: UpdateProjectArgs) => api.patch(`/api/projects/${id}`, payload),
    invalidateKeys: ({ id }) => [["projects"], ["projects", String(id)], ["projects-stats"]],
    successMessage: "Project updated.",
    errorMessage: "Failed to update project.",
  },
);

export default useUpdateProject;
