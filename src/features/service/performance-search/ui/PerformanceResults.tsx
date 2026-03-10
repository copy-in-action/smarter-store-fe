"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { PAGES } from "@/shared/config";
import { formatRegionName } from "@/shared/lib/region";
import { cn } from "@/shared/lib/utils";
import { useAutocompleteQuery } from "../api/search.queries";

/**
 * 공연 검색 결과 컴포넌트 Props
 */
interface PerformanceResultsProps {
  /** 검색 키워드 */
  keyword: string;
  /** 공연 클릭 시 호출될 콜백 */
  onPerformanceClick?: () => void;
  /** 키보드 네비게이션으로 선택된 항목 인덱스 (-1: 선택 없음) */
  selectedIndex?: number;
  /** 아이템 개수 변경 시 호출될 콜백 */
  onItemCountChange?: (count: number) => void;
}

/**
 * 검색어를 강조 처리합니다 (볼드)
 * @param text - 원본 텍스트
 * @param keyword - 강조할 검색어
 * @returns 강조 처리된 JSX 요소
 */
const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword.trim()) return text;

  const parts = text.split(new RegExp(`(${keyword})`, "gi"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <strong key={index.toString()} className="font-bold">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
};

/**
 * 공연 검색 결과 컴포넌트
 * - 자동완성 검색 결과 표시 (최대 6개)
 * - 검색어 강조 (볼드 처리)
 * - 공연 썸네일, 제목, 카테고리, 지역 표시
 */
export function PerformanceResults({
  keyword,
  onPerformanceClick,
  selectedIndex = -1,
  onItemCountChange,
}: PerformanceResultsProps) {
  const {
    data: performances,
    isLoading,
    error,
  } = useAutocompleteQuery(keyword);

  // 부모에게 아이템 개수 보고
  useEffect(() => {
    onItemCountChange?.(performances?.length ?? 0);
  }, [performances, onItemCountChange]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        검색 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-destructive">
        검색 중 오류가 발생했습니다
      </div>
    );
  }

  if (!performances || performances.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        검색 결과가 없습니다
      </div>
    );
  }

  return (
    <div className="py-2">
      {performances.map((performance, index) => (
        <Link
          key={performance.id}
          href={PAGES.PERFORMANCE.DETAIL.path(performance.id)}
          onClick={onPerformanceClick}
          data-autocomplete-index={index}
          className={cn(
            "flex gap-3 px-4 py-3 transition-colors cursor-pointer",
            index === selectedIndex ? "bg-accent" : "hover:bg-accent",
          )}
        >
          {/* 공연 썸네일 */}
          <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-muted">
            {performance.mainImageUrl ? (
              <Image
                src={performance.mainImageUrl}
                alt={performance.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                이미지 없음
              </div>
            )}
          </div>

          {/* 공연 정보 */}
          <div className="flex-1 min-w-0">
            {/* 공연명 (검색어 강조) */}
            <div className="text-sm tracking-tighter read truncate">
              {highlightKeyword(performance.title, keyword)}
            </div>

            {/* 카테고리 · 지역 */}
            <div className="text-xs text-muted-foreground mt-1">
              {performance.category}
              {performance.regionName && (
                <>
                  {" · "}
                  {formatRegionName(performance.regionName)}
                </>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
