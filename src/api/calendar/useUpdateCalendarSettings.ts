import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useUpdateCalendarSettings() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateCalendarSettingsRequest & { freeze_absence_ids?: number[] }) =>
      privateApi.patch("/api/settings/working-days", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-days"] });
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to save calendar settings."));
    },
  });

  return {
    updateCalendarSettings: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
