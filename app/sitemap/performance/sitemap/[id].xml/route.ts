import type { MetadataRoute } from "next";
import { getPerformancesForServer } from "@/entities/performance/api/performance.server.api";
import { PAGES } from "@/shared/config";

export const revalidate = 3600; // cache for 1 hour

const MAX_URLS_PER_SITEMAP = 50000;

/**
 * 동적 라우트 생성을 위한 ID 목록 생성
 */
export async function generateStaticParams() {
  try {
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 },
      cache: "default",
    });

    if (!response) return [];

    const totalSitemaps = Math.ceil(response.length / MAX_URLS_PER_SITEMAP);

    return Array.from({ length: totalSitemaps }, (_, index) => ({
      id: String(index),
    }));
  } catch (error) {
    console.error("Failed to generate sitemap params:", error);
    return [];
  }
}

/**
 * 특정 ID의 공연 사이트맵 XML 생성
 */
export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const SERVICE_DOMAIN = "https://ticket.devhong.cc";
  const { id } = await props.params;
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
