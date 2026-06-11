import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetOrganizationSettings() {

  return useQuery<OrganizationSettings>({
    queryKey: ["organization-settings"],
    queryFn: async () => {
      const { data } = await axiosClient.get<OrganizationSettings>("/api/settings/general");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
