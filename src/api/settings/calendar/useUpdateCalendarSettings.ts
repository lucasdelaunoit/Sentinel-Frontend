import { createMutationHook } from "@/lib/api/createMutationHook";

const useUpdateCalendarSettings = createMutationHook("updateCalendarSettings", {
  mutationFn: (api, payload: UpdateCalendarSettingsRequest & { freeze_absence_ids?: number[] }) =>
    api.patch("/api/settings/working-days", payload),
  invalidateKeys: () => [["working-days"]],
  errorMessage: "Failed to save calendar settings.",
});

export default useUpdateCalendarSettings;
