import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import type { UsersCapacityResponse } from "@/types/dashboard";

export default function useGetUsersCapacity() {
  const privateApi = usePrivateApi();

  return useQuery<UsersCapacityResponse>({
    queryKey: ["users", "capacity"],
    queryFn: async () => {
      const { data } = await privateApi.get<UsersCapacityResponse>("/api/users/capacity");
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
