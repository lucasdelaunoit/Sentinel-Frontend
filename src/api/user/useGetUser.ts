import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetUser(id: string | undefined) {

  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<User>(`/api/users/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
