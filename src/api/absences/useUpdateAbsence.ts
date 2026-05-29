import { useMutation, useQueryClient } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { toast } from "sonner";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";
import type { AbsenceType } from "@/types/absence";

interface UpdateAbsencePayload {
  id: number;
  userId: string;
  type?: AbsenceType;
  start_date?: string;
  end_date?: string;
  reason?: string | null;
}

export default function useUpdateAbsence() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, userId: _userId, ...body }: UpdateAbsencePayload) =>
      privateApi.patch(`/api/absences/${id}`, body),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "absences"] });
      toast.success("Absence updated.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update absence."));
    },
  });

  return {
    updateAbsence: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
