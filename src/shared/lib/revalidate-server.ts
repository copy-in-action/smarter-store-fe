/**
 * 서버 전용 Revalidation 함수 (Server Actions)
 * Secret 노출 없이 안전하게 캐시 무효화
 */

"use server";

import { revalidatePath } from "next/cache";

/**
 * 공연 관련 페이지들을 재검증합니다 (서버 전용)
 * @param performanceId - 수정/삭제된 공연 ID (선택적)
 */
export async function revalidatePerformancePages(performanceId?: number) {
  const paths = [
    "/", // 홈페이지
  ];

  // 특정 공연 상세 페이지도 재검증
  if (performanceId) {
    paths.push(`/performances/${performanceId}`);
  }

  // Next.js 내장 revalidatePath 사용 (secret 불필요)
  paths.forEach((path) => {
    revalidatePath(path);
    console.log(`✅ Revalidated (Server Action): ${path}`);
  });
}
