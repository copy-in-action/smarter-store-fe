/**
 * 서비스 페이지용 공연 상세 컴포넌트
 */

import type { ServicePerformanceDetailProps } from "../model/types";
import { PerformanceDescription } from "./PerformanceDescription";
import { PerformanceHashTags } from "./PerformanceHashTags";
import { PerformanceInfo } from "./PerformanceInfo";
import { PerformanceMainImage } from "./PerformanceMainImage";
import { PerformanceTitle } from "./PerformanceTitle";

/**
 * 서비스 페이지용 공연 상세 정보를 표시하는 메인 컴포넌트
 */
export function ServicePerformanceDetail({
  performance,
}: ServicePerformanceDetailProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* 제목 섹션 */}
        <PerformanceTitle
          title={performance.title}
          category={performance.category}
        />

        {/* 해시태그 네비게이션 */}
        <PerformanceHashTags />

        {/* 주요 정보 섹션 */}
        <PerformanceInfo performance={performance} />

        {/* 메인 이미지 섹션 */}
        <PerformanceMainImage
          imageUrl={performance.mainImageUrl}
          title={performance.title}
        />

        {/* 상세 설명 섹션 */}
        <PerformanceDescription
          description={performance.description}
          title={performance.title}
        />
      </div>
    </div>
  );
}
