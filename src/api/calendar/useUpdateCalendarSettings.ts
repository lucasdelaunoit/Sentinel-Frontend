import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useUpdateCalendarSettings() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCalendarSettingsRequest) => privateApi.put("/api/calendar/settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-summary"] });
      queryClient.invalidateQueries({ queryKey: ["organization-settings"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to save calendar settings."));
    },
  });
}
