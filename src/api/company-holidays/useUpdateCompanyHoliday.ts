import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface UpdateCompanyHolidayArgs extends CompanyHolidayRequest {
  id: number;
}

export default function useUpdateCompanyHoliday() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateCompanyHolidayArgs) =>
      privateApi.put<CompanyHoliday>(`/api/company-holidays/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-holidays"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-summary"] });
      toast.success("Holiday updated.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update holiday."));
    },
  });
}
