import createMutationHook from "@/api/createMutationHook";

const useCreateDepartment = createMutationHook(
  "createDepartment",
  {
    mutationFn: (api, { name }: CreateDepartmentRequest) =>
      api.post("/api/settings/departments", { name }),
    invalidateKeys: () => [["departments"]],
    successMessage: ({ name }) => `Department "${name}" created.`,
    errorMessage: "Failed to create department.",
  },
);

export default useCreateDepartment;
