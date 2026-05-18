import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useGetRules() {
  const privateApi = usePrivateApi();

  return useQuery<Rule[]>({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data } = await privateApi.get<Rule[] | { data: Rule[] }>("/api/settings/rules");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
