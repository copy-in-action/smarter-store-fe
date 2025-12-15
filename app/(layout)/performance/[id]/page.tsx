import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPerformanceDetailForServer } from "@/features/service/performance-detail";
import { PAGES } from "@/shared/constants/routes";
import PerformanceDetailView from "@/views/service/PerformanceDetailView";

/**
 * 공연 상세 페이지 속성
 */
interface PageProps {
  params: { id: string };
}

/**
 * 공연 상세 페이지 (SSR)
 */
export default async function PerformanceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const performanceId = Number.parseInt(id, 10);

  // ID가 유효하지 않으면 404
  if (Number.isNaN(performanceId) || performanceId <= 0) {
    notFound();
  }

  return <PerformanceDetailView performanceId={performanceId} />;
}

/**
 * 공연 상세 페이지 메타데이터 생성 (SEO)
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const performanceId = parseInt(id, 10);

  if (Number.isNaN(performanceId) || performanceId <= 0) {
    return {
      title: "페이지를 찾을 수 없습니다 | CIA",
      description: "요청하신 페이지를 찾을 수 없습니다.",
    };
  }

  try {
    const performance = await getPerformanceDetailForServer(performanceId);

    // routes.ts의 메타데이터 생성 함수 사용
    const baseMetadata = PAGES.PERFORMANCE.DETAIL.metadata(
      performance.title,
      performance.description?.substring(0, 160),
    );

    // 추가 정보 (이미지 등) 오버라이드
    return {
      ...baseMetadata,
      openGraph: {
        ...baseMetadata.openGraph,
        images: performance.mainImageUrl
          ? [
              {
                url: performance.mainImageUrl,
                width: 1200,
                height: 630,
                alt: `${performance.title} 포스터`,
              },
            ]
          : [],
      },
      twitter: {
        ...baseMetadata.twitter,
        images: performance.mainImageUrl ? [performance.mainImageUrl] : [],
      },
    };
  } catch (error) {
    console.error("메타데이터 생성 실패:", error);

    return {
      title: "공연 정보 | CIA",
      description: "공연 상세 정보를 확인하세요.",
    };
  }
}
