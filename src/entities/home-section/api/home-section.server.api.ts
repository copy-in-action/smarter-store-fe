/**
 * 서버 컴포넌트에서 사용할 홈 섹션 데이터 fetch 함수
 */

import { getGetAllSectionsUrl } from "@/shared/api/orval/home/home";
import type { HomeSectionResponse } from "@/shared/api/orval/types";
import { serverFetch } from "@/shared/api/server-fetch-wrapper";

/**
 * 서버에서 홈 섹션 목록을 조회합니다
 * 각 섹션에는 태그와 공연 목록이 포함되어 있습니다
 * @param fetchOptions - serverFetch에 전달할 옵션 (캐시, 인증 등)
 * @returns 홈 섹션 목록 데이터
 */
export async function getHomeSectionsForServer(
  fetchOptions: RequestInit & { requireAuth?: boolean } = {},
): Promise<HomeSectionResponse[]> {
  const mergedOptions = {
    requireAuth: false,
    cache: "no-store" as RequestCache,
    ...fetchOptions,
  };

  try {
    const response = await serverFetch<{
      data: { sections: HomeSectionResponse[] };
    }>(getGetAllSectionsUrl(), mergedOptions);

    return response.data?.sections || [];
  } catch (error) {
    console.error("Failed to fetch home sections:", error);
    return [];
  }
}
