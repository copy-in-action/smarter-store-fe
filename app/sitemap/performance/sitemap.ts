import type { MetadataRoute } from "next";
import { getPerformancesForServer } from "@/entities/performance/api/performance.server.api";
import { PAGES, SITE_URL } from "@/shared/config";

const MAX_URLS_PER_SITEMAP = 50000;

/**
 * 동적 사이트맵 ID 목록 생성
 * 반환된 각 id는 /sitemap/performance/sitemap/[id].xml 형태의 URL을 생성
 */
export async function generateSitemaps() {
  try {
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 },
      cache: "default",
    });

    if (!response || response.length === 0) {
      return [{ id: 0 }];
    }

    const totalSitemaps = Math.ceil(response.length / MAX_URLS_PER_SITEMAP);

    return Array.from({ length: totalSitemaps }, (_, index) => ({
      id: index,
    }));
  } catch (error) {
    console.error("Failed to generate sitemap params:", error);
    return [{ id: 0 }];
  }
}

/**
 * 특정 ID의 공연 사이트맵 생성
 * @param props - id를 포함한 props (Next.js 16+에서는 Promise)
 */
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const sitemapId = Number(id);

  try {
    const response = await getPerformancesForServer({
      next: { revalidate: 3600 },
      cache: "default",
    });

    if (!response) {
      return [];
    }

    const startIndex = sitemapId * MAX_URLS_PER_SITEMAP;
    const endIndex = Math.min(
      startIndex + MAX_URLS_PER_SITEMAP,
      response.length,
    );

    return response.slice(startIndex, endIndex).map((performance) => ({
      url: `${SITE_URL}${PAGES.PERFORMANCE.DETAIL.path(performance.id)}`,
      lastModified: performance.updatedAt
        ? new Date(performance.updatedAt)
        : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to generate performance sitemap:", error);
    return [];
  }
}
