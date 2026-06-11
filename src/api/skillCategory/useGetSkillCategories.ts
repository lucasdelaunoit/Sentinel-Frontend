import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "@/lib/api/client";

export default function useGetSkillCategories() {

  return useQuery<SkillCategory[]>({
    queryKey: ["skill-categories"],
    queryFn: async () => {
      const { data } = await axiosClient.get<SkillCategory[]>("/api/settings/skill-categories");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
