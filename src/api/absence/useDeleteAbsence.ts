import { createMutationHook } from "@/lib/api/createMutationHook";

interface DeleteAbsencePayload {
  id: number;
  userId: string;
}

const useDeleteAbsence = createMutationHook(
  "deleteAbsence",
  {
    mutationFn: (api, { id }: DeleteAbsencePayload) => api.delete(`/api/absences/${id}`),
    invalidateKeys: ({ userId }) => [["users", userId, "absences"]],
    successMessage: "Absence deleted.",
    errorMessage: "Failed to delete absence.",
  },
);

export default useDeleteAbsence;
