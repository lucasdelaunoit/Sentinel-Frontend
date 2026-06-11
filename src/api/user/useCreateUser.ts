import { createMutationHook } from "@/lib/api/createMutationHook";

const useCreateUser = createMutationHook(
  "createUser",
  {
    mutationFn: async (api, payload: CreateUserRequest) => {
      const { data } = await api.post<User>("/api/users", payload);
      return data;
    },
    invalidateKeys: () => [["users"], ["users-stats"]],
    successMessage: ({ firstname, lastname }) => `Employee "${firstname} ${lastname}" created.`,
    errorMessage: "Failed to create employee.",
  },
);

export default useCreateUser;
