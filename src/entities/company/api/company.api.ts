import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCompany,
  deleteCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
} from "@/shared/api/orval/company/company";
import type { CompanyRequest } from "@/shared/api/orval/types/companyRequest";
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

/**
 * 새로운 기획사/판매자를 생성하는 뮤테이션
 * @returns 기획사 생성 뮤테이션
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CompanyRequest): Promise<CompanyResponse> => {
      const response = await createCompany(data);
      if (response.status === 201) {
        return response.data;
      }
      throw new Error("기획사 생성에 실패했습니다");
    },
    onSuccess: () => {
      // 기획사 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}

/**
 * 기획사/판매자 정보를 수정하는 뮤테이션
 * @returns 기획사 수정 뮤테이션
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CompanyRequest;
    }): Promise<CompanyResponse> => {
      const response = await updateCompany(id, data);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error("기획사 정보 수정에 실패했습니다");
    },
    onSuccess: (_, { id }) => {
      // 기획사 목록 및 상세 정보 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.detail(id) });
    },
  });
}

/**
 * 기획사/판매자를 삭제하는 뮤테이션
 * @returns 기획사 삭제 뮤테이션
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await deleteCompany(id);
      if (response.status === 204) {
        return;
      }
      throw new Error("기획사 삭제에 실패했습니다");
    },
    onSuccess: () => {
      // 기획사 목록 쿼리 무효화하여 새로고침
      queryClient.invalidateQueries({ queryKey: companyQueryKeys.lists() });
    },
  });
}
