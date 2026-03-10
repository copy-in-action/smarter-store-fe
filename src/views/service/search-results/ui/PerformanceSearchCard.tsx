"use client";

import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PerformanceSearchResponse } from "@/shared/api/orval/types";
import { PAGES } from "@/shared/config";
import { formatRegionName } from "@/shared/lib/region";
import { Badge } from "@/shared/ui/badge";

/**
 * 공연 검색 카드 컴포넌트 Props
 */
interface PerformanceSearchCardProps {
  /** 공연 검색 결과 데이터 */
  performance: PerformanceSearchResponse;
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD → YYYY.MM.DD)
 * @param dateString - ISO 날짜 문자열
 * @returns 포맷팅된 날짜
 */
const formatDate = (dateString: string): string => {
  return dateString.replace(/-/g, ".");
};

/**
 * 공연 판매 상태를 계산합니다
 * @param startDate - 공연 시작일
 * @param endDate - 공연 종료일
 * @returns 판매 상태 정보 (라벨, variant)
 */
const getPerformanceStatus = (startDate: string, endDate: string) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // 시간 부분 제거하여 날짜만 비교

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (now < start) {
    return { label: "판매예정", variant: "secondary" as const };
  }
  if (now > end) {
    return { label: "판매종료", variant: "secondary" as const };
  }
  return { label: "판매중", variant: "secondary" as const };
};

/**
 * 공연 검색 카드 컴포넌트
 * - 2열 그리드 레이아웃에 최적화
 * - 이미지, 카테고리, 제목, 날짜, 장소 표시
 */
export function PerformanceSearchCard({
  performance,
}: PerformanceSearchCardProps) {
  const status = getPerformanceStatus(
    performance.startDate,
    performance.endDate,
  );

  return (
    <Link
      href={PAGES.PERFORMANCE.DETAIL.path(performance.id)}
      className="block group"
    >
      <div className="space-y-2">
        {/* 공연 이미지 */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          {performance.mainImageUrl ? (
            <Image
              src={performance.mainImageUrl}
              alt={performance.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              이미지 없음
            </div>
          )}

          {/* 카테고리 라벨 */}
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {performance.category}
            </Badge>
            <Badge
              variant={status.variant}
              className="bg-white/90 backdrop-blur-sm"
            >
              {status.label}
            </Badge>
          </div>
        </div>

        {/* 공연 정보 */}
        <div className="space-y-1">
          {/* 공연명 */}
          <h3 className="font-medium line-clamp-2 mb-2">{performance.title}</h3>

          {/* 공연 기간 */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              {formatDate(performance.startDate)}-
              {formatDate(performance.endDate)}
            </span>
          </div>

          {/* 공연장 정보 */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {performance.regionName &&
                formatRegionName(performance.regionName)}
              {performance.regionName && performance.venueAddress && " · "}
              {performance.venueAddress}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
