import type { MetadataRoute } from "next";
import { getPerformancesForServer } from "@/entities/performance/api/performance.server.api";
import { PAGES } from "@/shared/constants";

const MAX_URLS_PER_SITEMAP = 50000;

/**
 * 퍼포먼스 데이터를 기반으로 sitemap ID 목록 생성
 */
export async function generateSitemaps() {
  // FIXME: 공연 수만 가져온는 API 필요 - 전체 데이터를 가져오는 것은 비효율적
  const response = await getPerformancesForServer({
    next: { revalidate: 3600 },
    cache: "default",
  });

  if (!response) return [];

  const totalSitemaps = Math.ceil(response.length / MAX_URLS_PER_SITEMAP);

  return Array.from({ length: totalSitemaps }, (_, index) => ({
    id: index,
  }));
}

/**
 * 특정 sitemap ID(0,1,2...)에 해당하는 URL 목록 생성
 */
export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const SERVICE_DOMAIN = "https://ticket.devhong.cc";
  const id = Number(await props.id);

  // FIXME: 공연 수만 가져온는 API 필요 - 전체 데이터를 가져오는 것은 비효율적
  const response = await getPerformancesForServer({
    next: { revalidate: 3600 },
    cache: "default",
  });

  if (!response) return [];

  const startIndex = id * MAX_URLS_PER_SITEMAP;
  const endIndex = Math.min(startIndex + MAX_URLS_PER_SITEMAP, response.length);

  return response.slice(startIndex, endIndex).map((performance) => ({
    url: `${SERVICE_DOMAIN}${PAGES.PERFORMANCE.DETAIL.path(performance.id)}`,
    lastModified: performance.updatedAt
      ? new Date(performance.updatedAt)
      : new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));
}
