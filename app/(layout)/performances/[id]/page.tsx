import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPerformanceDetailForServer } from "@/entities/performance/api/performance.server.api";
import { PAGES, SITE_URL } from "@/shared/config";
import {
  createPerformanceSchema,
  safeJsonLdStringify,
} from "@/shared/lib/json-ld";
import PerformanceDetailView from "@/views/service/performances/PerformanceDetailView";

/**
 * ISR (Incremental Static Regeneration) 설정
 * - 300초(5분)마다 자동 재검증 (백그라운드)
 * - 관리자가 공연 수정/삭제 시 On-Demand Revalidation으로 즉시 업데이트
 */
export const revalidate = 300;

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

  // JSON-LD 구조화 데이터를 위한 공연 정보 조회
  let performanceSchemas: any[] = [];
  try {
    const performance = await getPerformanceDetailForServer(performanceId);

    // 최저 가격 계산
    const minPrice = 500;
    // FIXME: API 구현이 필요한 부분
    /*  performance.schedules?.reduce(
        (min, schedule) => Math.min(min, schedule.price || 0),
        Number.MAX_SAFE_INTEGER,
      ) || 0; */

    performanceSchemas = createPerformanceSchema({
      name: performance.title,
      description: performance.description || `${performance.title} 공연 정보`,
      startDate: performance.startDate || new Date().toISOString(),
      endDate: performance.endDate || undefined,
      location: {
        name: performance.venue?.name || "미정",
        address: performance.venue?.address || undefined,
      },
      offers:
        minPrice > 0
          ? {
              price: minPrice,
              currency: "KRW",
              availability: "https://schema.org/InStock",
            }
          : undefined,
      performer: performance.producer || undefined,
      image: performance.mainImageUrl || undefined,
      url: `${SITE_URL}/performances/${performanceId}`,
      category: performance.category || undefined, // 카테고리 정보 추가
    });
  } catch (error) {
    console.error("JSON-LD 스키마 생성 실패:", error);
  }

  return (
    <>
      {performanceSchemas.map((schema, index) => (
        <script
          key={index.toString()}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: safeJsonLdStringify(schema),
          }}
        />
      ))}
      <PerformanceDetailView performanceId={performanceId} />
    </>
  );
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
      title: "페이지를 찾을 수 없습니다 | YEME",
      description: "요청하신 페이지를 찾을 수 없습니다.",
    };
  }

  try {
    const performance = await getPerformanceDetailForServer(performanceId);

    // routes.ts의 메타데이터 생성 함수 사용 (canonical URL 포함)
    const baseMetadata = PAGES.PERFORMANCE.DETAIL.metadata(
      performanceId,
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

    // API 조회에 실패해도 페이지는 렌더링되므로 canonical은 유지한다
    return {
      title: "공연 정보 | YEME",
      description: "공연 상세 정보를 확인하세요.",
      alternates: {
        canonical: PAGES.PERFORMANCE.DETAIL.path(performanceId),
      },
    };
  }
}
