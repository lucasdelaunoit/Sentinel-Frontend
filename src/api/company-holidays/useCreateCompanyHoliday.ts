import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useCreateCompanyHoliday() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CompanyHolidayRequest & { freeze_absence_ids?: number[] }) =>
      privateApi.post<CompanyHoliday>("/api/settings/holidays", payload),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["company-holidays"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-summary"] });
      toast.success(`Holiday "${name}" added.`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to add holiday."));
    },
  });

  return {
    createCompanyHoliday: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
