/**
 * 공연 상세 설명 섹션 컴포넌트
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

/**
 * 공연 설명 컴포넌트 속성
 */
interface PerformanceDescriptionProps {
  /** 공연 설명 */
  description?: string;
  /** 공연 제목 (fallback용) */
  title: string;
}

/**
 * 공연 상세 설명을 표시하는 컴포넌트
 */
export function PerformanceDescription({
  description,
  title,
}: PerformanceDescriptionProps) {
  return (
    <section id="description" className="py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            공연 소개
          </CardTitle>
        </CardHeader>

        <CardContent>
          {description ? (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {title}에 대한 상세 정보가 준비중입니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
