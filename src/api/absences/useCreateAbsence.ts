import { useMutation, useQueryClient } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { toast } from "sonner";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";
import type { AbsenceType } from "@/types/dashboard";

interface CreateAbsencePayload {
  userId: string;
  type: AbsenceType;
  start_date: string;
  end_date: string;
  reason?: string;
}

export default function useCreateAbsence() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, ...body }: CreateAbsencePayload) =>
      privateApi.post(`/api/users/${userId}/absences`, body),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId, "absences"] });
      toast.success("Absence added.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to add absence."));
    },
  });
}
