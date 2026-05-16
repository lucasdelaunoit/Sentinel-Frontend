import { useQuery } from "@tanstack/react-query";
import usePrivateApi from "@/api/privateApi";

export default function useGetCompanyHolidays() {
  const privateApi = usePrivateApi();

  return useQuery<CompanyHoliday[]>({
    queryKey: ["company-holidays"],
    queryFn: async () => {
      const { data } = await privateApi.get<CompanyHoliday[]>("/api/company-holidays");
      return data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
