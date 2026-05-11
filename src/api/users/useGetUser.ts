import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";

export default function useGetUser(id: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<User>({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data } = await privateApi.get<User>(`/api/users/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
