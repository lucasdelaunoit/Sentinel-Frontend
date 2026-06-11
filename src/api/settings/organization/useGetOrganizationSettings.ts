import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetOrganizationSettings() {
  const privateApi = usePrivateApi();

  return useQuery<OrganizationSettings>({
    queryKey: ["organization-settings"],
    queryFn: async () => {
      const { data } = await privateApi.get<OrganizationSettings>("/api/settings/general");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
