import type { MetadataRoute } from "next";
import { SITE_URL } from "@/shared/config";

/**
 * robots.txt 동적 생성
 * 환경변수에서 사이트 URL을 가져와 sitemap URL을 설정합니다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
