import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import useLaravelQuery from "@/hooks/useLaravelQuery";
import type { AbsenceItem } from "@/types/dashboard";
import type { LaravelPaginatedResponse, LaravelQueryParams } from "@/types/laravel";

export default function useGetAbsencesForUser(userId: string | undefined, params: LaravelQueryParams = {}) {
  const privateApi = usePrivateApi();
  const queryString = useLaravelQuery(params);

  return useQuery<LaravelPaginatedResponse<AbsenceItem>>({
    queryKey: ["users", userId, "absences", queryString],
    queryFn: async () => {
      const { data } = await privateApi.get<LaravelPaginatedResponse<AbsenceItem>>(
        `/api/users/${userId}/absences${queryString}`,
      );
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
