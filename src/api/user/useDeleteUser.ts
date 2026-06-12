import { createMutationHook } from "@/lib/api/createMutationHook";

const useDeleteUser = createMutationHook(
  "deleteUser",
  {
    mutationFn: (api, id: number) => api.delete(`/api/users/${id}`),
    invalidateKeys: () => [["users"]],
    successMessage: "Employee deleted.",
    errorMessage: "Failed to delete employee.",
  },
);

export default useDeleteUser;
