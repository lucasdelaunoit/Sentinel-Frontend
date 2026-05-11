import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useGetSkillCategories() {
  const privateApi = usePrivateApi();

  return useQuery<SkillCategory[]>({
    queryKey: ["skill-categories"],
    queryFn: async () => {
      const { data } = await privateApi.get<SkillCategory[]>("/api/skill-categories");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
