import { useMutation, useQueryClient } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { toast } from "sonner";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface CreateAbsencePayload {
  userId: string;
  type?: AbsenceType;
  start_date: string;
  start_half?: AbsenceHalf;
  end_date: string;
  end_half?: AbsenceHalf;
  reason?: string;
}

export default function useCreateAbsence() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, ...body }: CreateAbsencePayload) => privateApi.post(`/api/users/${userId}/absences`, body),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "absences"] });
      toast.success("Absence added.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to add absence."));
    },
  });

  return {
    createAbsence: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
