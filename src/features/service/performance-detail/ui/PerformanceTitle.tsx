/**
 * 공연 제목 섹션 컴포넌트
 */

import { Badge } from "@/shared/ui/badge";

/**
 * 공연 제목 컴포넌트 속성
 */
interface PerformanceTitleProps {
  /** 공연 제목 */
  title: string;
  /** 공연 카테고리 */
  category: string;
}

/**
 * 공연 제목과 카테고리를 표시하는 컴포넌트
 */
export function PerformanceTitle({ title, category }: PerformanceTitleProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {title}
        </h1>

        <div className="flex items-center">
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200"
          >
            {category}
          </Badge>
        </div>
      </div>
    </div>
  );
}
