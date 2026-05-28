import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { UserSkillDetail } from "@/types/dashboard";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

export default function useGetSkillsForUser(userId: string | undefined, params: QueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<UserSkillDetail>>({
    queryKey: ["users", userId, "skills", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<UserSkillDetail>>(
        `/api/users/${userId}/skills${queryString}`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
