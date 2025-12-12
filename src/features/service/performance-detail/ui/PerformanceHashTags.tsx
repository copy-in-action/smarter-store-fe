/**
 * 공연 상세 페이지 해시태그 네비게이션 컴포넌트
 */

"use client";

import { Button } from "@/shared/ui/button";
import type { HashTagItem, PerformanceHashTagsProps } from "../model/types";

/**
 * 페이지 내 섹션 이동을 위한 해시태그 네비게이션
 */
export function PerformanceHashTags({
  activeSection,
}: PerformanceHashTagsProps) {
  /**
   * 해시태그 항목들
   */
  const hashTags: HashTagItem[] = [
    { id: "info", label: "#주요정보" },
    { id: "image", label: "#메인이미지" },
    { id: "description", label: "#상세설명" },
  ];

  /**
   * 해시태그 클릭 핸들러 - 해당 섹션으로 스크롤
   * @param sectionId - 이동할 섹션 ID
   */
  const handleHashTagClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 py-4">
      {hashTags.map((tag) => (
        <Button
          key={tag.id}
          variant={activeSection === tag.id ? "default" : "outline"}
          size="sm"
          onClick={() => handleHashTagClick(tag.id)}
          className={`text-sm px-3 py-1 transition-colors ${
            activeSection === tag.id
              ? "bg-blue-600 text-white"
              : "text-blue-600 border-blue-200 hover:bg-blue-50"
          }`}
        >
          {tag.label}
        </Button>
      ))}
    </div>
  );
}
