import createMutationHook from "@/api/createMutationHook";

interface UpdateCompanyHolidayArgs extends CompanyHolidayRequest {
  id: number;
  freeze_absence_ids?: number[];
}

const useUpdateCompanyHoliday = createMutationHook(
  "updateCompanyHoliday",
  {
    mutationFn: (api, { id, ...payload }: UpdateCompanyHolidayArgs) =>
      api.patch<CompanyHoliday>(`/api/settings/holidays/${id}`, payload),
    invalidateKeys: () => [["company-holidays"], ["calendar-summary"]],
    successMessage: "Holiday updated.",
    errorMessage: "Failed to update holiday.",
  },
);

export default useUpdateCompanyHoliday;
