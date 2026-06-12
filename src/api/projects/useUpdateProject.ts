import { createMutationHook } from "@/lib/api/createMutationHook";

interface UpdateProjectArgs {
  id: string | number;
  payload: UpdateProjectRequest;
}

const useUpdateProject = createMutationHook(
  "updateProject",
  {
    mutationFn: (api, { id, payload }: UpdateProjectArgs) => api.patch(`/api/projects/${id}`, payload),
    invalidateKeys: () => [["projects"]],
    successMessage: "Project updated.",
    errorMessage: "Failed to update project.",
  },
);

export default useUpdateProject;
