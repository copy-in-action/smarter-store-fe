import type { MetadataRoute } from "next";
import type { NextRequest } from "next/server";
import { getPerformancesForServer } from "@/entities/performance/api/performance.server.api";
import { PAGES, SITE_URL } from "@/shared/config";

export const revalidate = 3600; // cache for 1 hour
export const dynamicParams = false; // generateStaticParams에서 생성된 경로만 허용

const MAX_URLS_PER_SITEMAP = 50000;

type RouteParams = {
  id: string;
};

/**
 * 동적 라우트 생성을 위한 ID 목록 생성
 * 빌드 에러 방지를 위해 최소 1개의 sitemap ID는 항상 생성
 */
export async function generateStaticParams(): Promise<RouteParams[]> {
  try {
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 },
      cache: "default",
    });

    if (!response || response.length === 0) {
      // 빈 배열 반환 시 빌드 에러 발생하므로 최소 1개 반환
      return [{ id: "0" }];
    }

    const totalSitemaps = Math.ceil(response.length / MAX_URLS_PER_SITEMAP);

    return Array.from({ length: totalSitemaps }, (_, index) => ({
      id: String(index),
    }));
  } catch (error) {
    console.error("Failed to generate sitemap params:", error);
    // 에러 시에도 최소 1개의 ID 반환 (빌드 에러 방지)
    return [{ id: "0" }];
  }
}

/**
 * 특정 ID의 공연 사이트맵 XML 생성
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<Record<string, string>> },
) {
  const SERVICE_DOMAIN = SITE_URL;

  // params 안전성 검증
  const params = await context.params;
  if (!params || !params.id) {
    console.error("Sitemap ID parameter is missing");
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml",
        },
        status: 400,
      },
    );
  }

  const { id } = params as RouteParams;
  const sitemapId = Number(id);

  try {
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 },
      cache: "default",
    });

    if (!response) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
        {
          headers: {
            "Content-Type": "application/xml",
          },
        },
      );
    }

    const startIndex = sitemapId * MAX_URLS_PER_SITEMAP;
    const endIndex = Math.min(
      startIndex + MAX_URLS_PER_SITEMAP,
      response.length,
    );

    const sitemapData: MetadataRoute.Sitemap = response
      .slice(startIndex, endIndex)
      .map((performance) => ({
        url: `${SERVICE_DOMAIN}${PAGES.PERFORMANCE.DETAIL.path(performance.id)}`,
        lastModified: performance.updatedAt
          ? new Date(performance.updatedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        changeFrequency: "daily",
        priority: 0.8,
      }));

    // XML 생성
    const urlEntries = sitemapData
      .map(
        (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`.trim();

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Failed to generate performance sitemap:", error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`,
      {
        headers: {
          "Content-Type": "application/xml",
        },
        status: 500,
      },
    );
  }
}
