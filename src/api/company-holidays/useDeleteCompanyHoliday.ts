import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useDeleteCompanyHoliday() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => privateApi.delete(`/api/settings/holidays/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-holidays"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-summary"] });
      toast.success("Holiday deleted.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to delete holiday."));
    },
  });
}
