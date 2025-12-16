import type { MetadataRoute } from "next";
import { getPerformancesForServer } from "@/features/home/api/home-server.api";

/** sitemap 파일당 최대 URL 개수 (Google 권장사항) */
const MAX_URLS_PER_SITEMAP = 50000;

/**
 * 메인 사이트맵 인덱스 /sitemap.xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SERVICE_DOMAIN = "https://ticket.devhong.cc";

  const sitemaps: MetadataRoute.Sitemap = [
    { url: `${SERVICE_DOMAIN}/sitemap/sitemap.xml` },
  ];

  try {
    // FIXME: 공연 수만 가져온는 API 필요 - 전체 데이터를 가져오는 것은 비효율적
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 }, // 1시간 캐싱으로 정적 생성 지원
      cache: "default",
    });

    if (response) {
      const totalPerformances = response.length;
      const totalSitemaps = Math.ceil(totalPerformances / MAX_URLS_PER_SITEMAP);

      // 각 퍼포먼스 사이트맵 URL 생성 (0, 1, 2, ... 형태)
      for (let i = 0; i < totalSitemaps; i++) {
        sitemaps.push({
          url: `${SERVICE_DOMAIN}/sitemap/performance/${i}.xml`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }

    return sitemaps;
  } catch (error) {
    console.error("Failed to generate performance sitemap index:", error);
    return sitemaps; // 기존 sitemap/sitemap.xml은 유지
  }
}
