/**
 * 공연 주요 정보 섹션 컴포넌트
 */

import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { PerformanceInfoProps } from "../model/types";

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param dateString - ISO 날짜 문자열
 * @returns 포맷된 날짜 문자열
 */
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

/**
 * 공연 주요 정보를 표시하는 컴포넌트 (장소, 마지막일, 공연시간, 연령)
 */
export function PerformanceInfo({ performance }: PerformanceInfoProps) {
  return (
    <section id="info" className="py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            공연 주요 정보
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 공연장 정보 */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">공연장</h3>
                <p className="text-gray-700">
                  {performance.venue?.name || "미정"}
                </p>
                {performance.venue?.address && (
                  <p className="text-sm text-gray-500 mt-1">
                    {performance.venue.address}
                  </p>
                )}
              </div>
            </div>

            {/* 공연 마지막일 */}
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">공연 종료일</h3>
                <p className="text-gray-700">
                  {formatDate(performance.endDate)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(performance.startDate)} ~{" "}
                  {formatDate(performance.endDate)}
                </p>
              </div>
            </div>

            {/* 공연시간 */}
            {performance.runningTime && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">공연시간</h3>
                  <p className="text-gray-700">{performance.runningTime}분</p>
                </div>
              </div>
            )}

            {/* 관람 연령 */}
            {performance.ageRating && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">관람 연령</h3>
                  <p className="text-gray-700">{performance.ageRating}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
