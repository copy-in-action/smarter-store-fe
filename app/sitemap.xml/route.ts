import { getPerformancesForServer } from "@/entities/performance/api/performance.server.api";

export const revalidate = 3600; // cache for 1 hour

/** sitemap 파일당 최대 URL 개수 (Google 권장사항) */
const MAX_URLS_PER_SITEMAP = 50000;

/**
 * 사이트맵 인덱스 XML 생성 - 모든 하위 사이트맵들의 목록
 */
export async function GET() {
  const BASE_URL = "https://ticket.devhong.cc";

  // 정적 사이트맵 목록
  const staticSitemaps = [
    `${BASE_URL}/sitemap/sitemap.xml`, // 정적 페이지들
  ];

  // 동적 공연 사이트맵 목록 생성
  const dynamicSitemaps: string[] = [];

  try {
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 },
      cache: "default",
    });

    if (response) {
      const totalPerformances = response.length;
      const totalSitemaps = Math.ceil(totalPerformances / MAX_URLS_PER_SITEMAP);

      // 동적 사이트맵 URL 생성
      for (let i = 0; i < totalSitemaps; i++) {
        dynamicSitemaps.push(
          `${BASE_URL}/sitemap/performance/sitemap/${i}.xml`,
        );
      }
    }
  } catch (error) {
    console.error("Failed to generate dynamic sitemaps list:", error);
  }

  // 모든 사이트맵 URL 합치기
  const allSitemaps = [...staticSitemaps, ...dynamicSitemaps];

  // XML 사이트맵 인덱스 생성
  const sitemapEntries = allSitemaps
    .map(
      (url) => `    <sitemap>
      <loc>${url}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${sitemapEntries}
        </sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
