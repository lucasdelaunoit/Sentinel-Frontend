import createMutationHook from "@/api/createMutationHook.ts";

const useUpdateOrganizationSettings = createMutationHook("updateOrganizationSettings", {
  mutationFn: (api, payload: UpdateOrganizationSettingsRequest) =>
    api.patch<OrganizationSettings>("/api/settings/general", payload),
  invalidateKeys: () => [["organization-settings"]],
  successMessage: "Organization settings saved.",
  errorMessage: "Failed to save organization settings.",
});

export default useUpdateOrganizationSettings;
