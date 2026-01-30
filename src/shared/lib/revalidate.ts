/**
 * On-Demand Revalidation 헬퍼 함수
 * 관리자가 데이터를 변경했을 때 캐시를 즉시 무효화
 */

/**
 * 특정 경로의 캐시를 재검증합니다
 * @param path - 재검증할 경로 (예: "/", "/performances")
 * @returns 재검증 성공 여부
 */
export async function revalidatePage(path: string): Promise<boolean> {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        secret: process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
      }),
    });

    if (!response.ok) {
      console.error(`Failed to revalidate ${path}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Revalidated: ${path}`, data);
    return true;
  } catch (error) {
    console.error(`Error revalidating ${path}:`, error);
    return false;
  }
}

/**
 * 공연 관련 페이지들을 재검증합니다
 * 공연 생성/수정/삭제 시 호출
 */
export async function revalidatePerformancePages() {
  await Promise.all([
    revalidatePage("/"), // 홈페이지
    revalidatePage("/performances"), // 공연 목록 (있다면)
  ]);
}
