import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetUsersCapacity() {

  return useQuery<UsersCapacityResponse>({
    queryKey: ["users", "capacity"],
    queryFn: async () => {
      const { data } = await axiosClient.get<UsersCapacityResponse>("/api/users/capacity");
      return data;
    },
    staleTime: 1000 * 60,
    retry: 1,
  });
}
