import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi.ts";
import type { ProjectDetailResponse } from "@/types/dashboard";

export default function useGetProject(id: string | undefined) {
  const privateApi = usePrivateApi();

  return useQuery<ProjectDetailResponse>({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await privateApi.get<ProjectDetailResponse>(`/api/projects/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
