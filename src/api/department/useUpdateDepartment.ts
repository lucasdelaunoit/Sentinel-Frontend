import createMutationHook from "@/api/createMutationHook";

const useUpdateDepartment = createMutationHook(
  "updateDepartment",
  {
    mutationFn: (api, { id, name }: UpdateDepartmentRequest) =>
      api.patch(`/api/settings/departments/${id}`, { name }),
    invalidateKeys: () => [["departments"]],
    successMessage: ({ name }) => `Department "${name}" updated.`,
    errorMessage: "Failed to update department.",
  },
);

export default useUpdateDepartment;
