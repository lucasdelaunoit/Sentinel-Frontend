import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import usePrivateApi from "@/api/privateApi";
import extractApiErrorMessage from "@/utils/extractApiErrorMessage";

export default function useUpdateOrganizationSettings() {
  const privateApi = usePrivateApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateOrganizationSettingsRequest) =>
      privateApi.put<OrganizationSettings>("/api/organization/settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-settings"] });
      toast.success("Organization settings saved.");
    },
    onError: (error) => {
      toast.error(extractApiErrorMessage(error, "Failed to save organization settings."));
    },
  });

  return {
    updateOrganizationSettings: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
