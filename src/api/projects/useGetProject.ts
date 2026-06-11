import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetProject(id: string | undefined) {

  return useQuery<ProjectDetailResponse>({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ProjectDetailResponse>(`/api/projects/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
