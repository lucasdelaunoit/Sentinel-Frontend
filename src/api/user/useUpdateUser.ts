import { createMutationHook } from "@/lib/api/createMutationHook";

interface UpdateUserArgs {
  id: string | number;
  payload: UpdateUserRequest;
}

const useUpdateUser = createMutationHook(
  "updateUser",
  {
    mutationFn: async (api, { id, payload }: UpdateUserArgs) => {
      const { data } = await api.patch<User>(`/api/users/${id}`, payload);
      return data;
    },
    invalidateKeys: () => [["users"]],
    successMessage: "Profile updated.",
    errorMessage: "Failed to update profile.",
  },
);

export default useUpdateUser;
