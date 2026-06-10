import createMutationHook from "@/api/createMutationHook";

const useDeleteCompanyHoliday = createMutationHook(
  "deleteCompanyHoliday",
  {
    mutationFn: (api, id: number) => api.delete(`/api/settings/holidays/${id}`),
    invalidateKeys: () => [["company-holidays"], ["calendar-summary"]],
    successMessage: "Holiday deleted.",
    errorMessage: "Failed to delete holiday.",
  },
);

export default useDeleteCompanyHoliday;
