import createMutationHook from "@/api/createMutationHook";

interface CreateAbsencePayload {
  userId: string;
  type?: AbsenceType;
  start_date: string;
  start_half?: AbsenceHalf;
  end_date: string;
  end_half?: AbsenceHalf;
  reason?: string;
}

const useCreateAbsence = createMutationHook(
  "createAbsence",
  {
    mutationFn: (api, { userId, ...body }: CreateAbsencePayload) =>
      api.post(`/api/users/${userId}/absences`, body),
    invalidateKeys: ({ userId }) => [["users", userId, "absences"]],
    successMessage: "Absence added.",
    errorMessage: "Failed to add absence.",
  },
);

export default useCreateAbsence;
