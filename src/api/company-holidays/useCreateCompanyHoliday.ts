import createMutationHook from "@/api/createMutationHook";

const useCreateCompanyHoliday = createMutationHook(
  "createCompanyHoliday",
  {
    mutationFn: (api, payload: CompanyHolidayRequest & { freeze_absence_ids?: number[] }) =>
      api.post<CompanyHoliday>("/api/settings/holidays", payload),
    invalidateKeys: () => [["company-holidays"], ["calendar-summary"]],
    successMessage: ({ name }) => `Holiday "${name}" added.`,
    errorMessage: "Failed to add holiday.",
  },
);

export default useCreateCompanyHoliday;
