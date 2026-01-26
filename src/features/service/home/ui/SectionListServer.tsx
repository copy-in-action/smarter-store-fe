/**
 * 서버 컴포넌트 - 홈 섹션 데이터 fetch 및 hydration
 * Suspense boundary와 함께 사용하여 스트리밍 렌더링 지원
 */

import { getHomeSectionsForServer } from "@/entities/home-section/api/home-section.server.api";
import { SectionList } from "./SectionListClient";

/**
 * 홈 섹션 리스트 서버 컴포넌트
 * 서버에서 섹션 데이터를 페칭하여 클라이언트 컴포넌트에 전달합니다
 */
export default async function SectionListServer() {
  const sections = await getHomeSectionsForServer();
  return <SectionList initialData={sections} />;
}
