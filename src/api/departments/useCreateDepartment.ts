import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useCreateDepartment() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name }: CreateDepartmentRequest) =>
      privateApi.post("/api/settings/departments", { name }),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success(`Department "${name}" created.`);
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to create department."));
    },
  });
}
