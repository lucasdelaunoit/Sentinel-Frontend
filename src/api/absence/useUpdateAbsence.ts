import createMutationHook from "@/api/createMutationHook";

interface UpdateAbsencePayload {
  id: number;
  userId: string;
  type?: AbsenceType;
  start_date?: string;
  start_half?: AbsenceHalf;
  end_date?: string;
  end_half?: AbsenceHalf;
  reason?: string | null;
}

const useUpdateAbsence = createMutationHook(
  "updateAbsence",
  {
    mutationFn: (api, { id, ...body }: UpdateAbsencePayload) => {
      // userId addresses the absence's owner for cache invalidation only; it is not part of the patch body.
      delete (body as Partial<UpdateAbsencePayload>).userId;
      return api.patch(`/api/absences/${id}`, body);
    },
    invalidateKeys: ({ userId }) => [["users", userId, "absences"]],
    successMessage: "Absence updated.",
    errorMessage: "Failed to update absence.",
  },
);

export default useUpdateAbsence;
