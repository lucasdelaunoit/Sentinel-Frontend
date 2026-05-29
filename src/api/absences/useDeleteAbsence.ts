import { useMutation, useQueryClient } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { toast } from "sonner";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface DeleteAbsencePayload {
  id: number;
  userId: string;
}

export default function useDeleteAbsence() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id }: DeleteAbsencePayload) => privateApi.delete(`/api/absences/${id}`),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "absences"] });
      toast.success("Absence deleted.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to delete absence."));
    },
  });

  return {
    deleteAbsence: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
