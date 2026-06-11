import { createMutationHook } from "@/lib/api/createMutationHook";

const useDeleteDepartment = createMutationHook(
  "deleteDepartment",
  {
    mutationFn: (api, id: number) => api.delete(`/api/settings/departments/${id}`),
    invalidateKeys: () => [["departments"], ["rules"], ["projects"]],
    successMessage: "Department deleted.",
    errorMessage: "Failed to delete department.",
  },
);

export default useDeleteDepartment;
