import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import { useQueryString, unwrapPagination } from "@/hooks/pagination";
import type { AbsenceItem } from "@/types/dashboard";
import type { PaginatedResponse, QueryParams } from "@/types/pagination";

export default function useGetAbsencesForUser(userId: string | undefined, params: QueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<AbsenceItem>>({
    queryKey: ["users", userId, "absences", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<PaginatedResponse<AbsenceItem>>(
        `/api/users/${userId}/absences${queryString}`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return { ...rest, ...unwrapPagination(raw) };
}
