import type { MetadataRoute } from "next";
import { SERVICE_PAGES } from "@/shared/config";

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

//FIXME: 환경변수로 도메인 변경하게 수정
export default function sitemap(): MetadataRoute.Sitemap {
  const SERVICE_DOMAIN = "https://ticket.devhong.cc";

  return [...collectSitemapPaths(SERVICE_PAGES, SERVICE_DOMAIN)];
}
