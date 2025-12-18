import { useQuery } from "@tanstack/react-query";
import {
  getAllCompanies,
  getCompany,
} from "@/shared/api/orval/company/company";
import type { CompanyResponse } from "@/shared/api/orval/types/companyResponse";

/**
 * 기획사/판매자 쿼리 키
 */
export const companyQueryKeys = {
  all: ["companies"] as const,
  lists: () => [...companyQueryKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...companyQueryKeys.lists(), { filters }] as const,
  details: () => [...companyQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...companyQueryKeys.details(), id] as const,
};

/**
 * 모든 기획사/판매자 목록을 조회합니다
 * @returns 기획사/판매자 목록 쿼리
 */
export function useGetAllCompanies() {
  return useQuery({
    queryKey: companyQueryKeys.lists(),
    queryFn: async (): Promise<CompanyResponse[]> => {
      const response = await getAllCompanies();
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("기획사 목록 조회에 실패했습니다");
    },
  });
}

/**
 * 특정 기획사/판매자 정보를 조회합니다
 * @param id - 기획사 ID
 * @returns 기획사 상세 정보 쿼리
 */
export function useGetCompany(id: number) {
  return useQuery({
    queryKey: companyQueryKeys.detail(id),
    queryFn: async (): Promise<CompanyResponse> => {
      const response = await getCompany(id);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("기획사 정보 조회에 실패했습니다");
    },
    enabled: !!id,
  });
}
