import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

interface UpdateUserArgs {
  id: string | number;
  payload: UpdateUserRequest;
}

export default function useUpdateUser() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, payload }: UpdateUserArgs) => {
      const { data } = await privateApi.patch<User>(`/api/users/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", String(id)] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      toast.success("Profile updated.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to update profile."));
    },
  });

  return {
    updateUser: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
