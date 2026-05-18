import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useGetRuleViolations() {
  const privateApi = usePrivateApi();

  return useQuery<RuleViolation[]>({
    queryKey: ["rule-violations"],
    queryFn: async () => {
      const { data } = await privateApi.get<RuleViolation[] | { data: RuleViolation[] }>("/api/rules/violations");
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
