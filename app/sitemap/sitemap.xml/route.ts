import type { MetadataRoute } from "next";
import { SERVICE_PAGES, SITE_URL } from "@/shared/config";

export const revalidate = 3600; // cache for 1 hour

type PageNode = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  path?: string | ((...args: any[]) => string);
  siteMap?: {
    priority: number;
    changeFrequency: string;
  };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
};

/**
 * SERVICE_PAGES 구조를 순회하며 sitemap 경로 수집
 * @param pages - SERVICE_PAGES 객체
 * @param baseUrl - 기본 도메인 URL
 * @returns Sitemap 배열
 */
export function collectSitemapPaths(
  pages: Record<string, PageNode>,
  baseUrl: string,
): MetadataRoute.Sitemap {
  const result: MetadataRoute.Sitemap = [];
  const now = new Date();

  const traverse = (node: PageNode) => {
    if (node.siteMap && typeof node.path === "string") {
      result.push({
        url: `${baseUrl}${node.path === "/" ? "" : node.path}`,
        lastModified: now.toISOString().split("T")[0],
        changeFrequency: node.siteMap.changeFrequency as
          | "always"
          | "hourly"
          | "daily"
          | "weekly"
          | "monthly"
          | "yearly"
          | "never",
        priority: node.siteMap.priority,
      });
    }

    Object.values(node).forEach((value) => {
      if (typeof value === "object" && value !== null) {
        traverse(value);
      }
    });
  };

  traverse(pages);
  return result;
}

/**
 * 정적 페이지들의 sitemap XML 생성
 */
export async function GET() {
  const sitemapData = collectSitemapPaths(SERVICE_PAGES, SITE_URL);

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
}
