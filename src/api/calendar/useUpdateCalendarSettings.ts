import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useUpdateCalendarSettings() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCalendarSettingsRequest) => privateApi.patch("/api/settings/working-days", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-days"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to save calendar settings."));
    },
  });
}
