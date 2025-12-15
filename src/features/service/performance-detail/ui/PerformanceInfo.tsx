/**
 * 공연 주요 정보 섹션 컴포넌트
 */

import type { PerformanceInfoProps } from "../model/types";

/**
 * 공연 주요 정보를 표시하는 컴포넌트 (장소, 마지막일, 공연시간, 연령)
 */
export function PerformanceInfo({ performance }: PerformanceInfoProps) {
  return (
    <section className="text-sm flex flex-col gap-1.5 wrapper">
      {/* 장소 */}
      <div className="flex items-center gap-3">
        <div className="text-gray-500">장소</div>
        <div>{performance.venue?.name || "미정"}</div>
      </div>

      {/* 기간 */}
      <div className="flex items-center gap-3">
        <div className="text-gray-500">기간</div>
        <div>
          {performance.startDate} ~ {performance.endDate}
        </div>
      </div>

      {/* 공연시간 */}
      {performance.runningTime && (
        <div className="flex items-center gap-3">
          <div className="text-gray-500">시간</div>
          <div>{performance.runningTime} 분</div>
        </div>
      )}

      {/* 관람 연령 */}
      {performance.ageRating && (
        <div className="flex items-center gap-3">
          <div className="text-gray-500">연령</div>
          <div>{performance.ageRating}</div>
        </div>
      )}
    </section>
  );
}
