import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";

export default function useGetSkillsForUser(userId: string | undefined, params: QueryParams = {}) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<UserSkillDetail>>({
    queryKey: ["users", userId, "skills", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<UserSkillDetail>>(
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
