import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";
import { useQueryString, unwrapPagination, type PaginatedResponse, type QueryParams } from "@/lib/api/pagination";
import type { AbsenceItem } from "@/types/dashboard";

export default function useGetAbsencesForUser(userId: string | undefined, params: QueryParams = {}) {
  const queryString = useQueryString(params);

  const { data: raw, ...rest } = useQuery<PaginatedResponse<AbsenceItem>>({
    queryKey: ["users", userId, "absences", queryString],
    queryFn: async () => {
      const { data } = await axiosClient.get<PaginatedResponse<AbsenceItem>>(
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
