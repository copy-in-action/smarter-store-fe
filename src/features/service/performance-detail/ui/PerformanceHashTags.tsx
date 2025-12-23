/**
 * 공연 상세 페이지 해시태그 네비게이션 컴포넌트
 */

"use client";

import { useInView } from "react-intersection-observer";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import type { HashTagItem } from "../model/types";

/**
 * 페이지 내 섹션 이동을 위한 해시태그 네비게이션
 */
export function PerformanceHashTags() {
  const { ref, inView } = useInView({
    threshold: 1,
    rootMargin: "-50px 0px 0px 0px",
  });

  /**
   * 해시태그 항목들
   */
  const hashTags: HashTagItem[] = [
    { id: "image", label: "상품 상세" },
    { id: "discountInfo", label: "할인정보" },
    { id: "usageGuide", label: "이용안내" },
    { id: "venue", label: "장소" },
    { id: "refundPolicy", label: "취소 및 환불규정" },
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
    <>
      <div className="flex flex-wrap gap-1.5 my-5 p-detail-wrapper">
        {hashTags.map((tag) => (
          <Button
            key={tag.id}
            variant={"outline"}
            size="sm"
            onClick={() => handleHashTagClick(tag.id)}
            className={
              "text-sm font-normal p-4 rounded-full transition-colors text-gray-600"
            }
          >
            {tag.label}
          </Button>
        ))}
        <div ref={ref}></div>
      </div>

      <div
        id="performance-detail-hashtags"
        className={cn(
          "sticky sm:top-[101px] z-50 top-[91px] flex gap-4 bg-background border-b p-detail-wrapper overflow-auto scrollbar-hide",
          inView && "hidden",
        )}
      >
        {hashTags.map((tag) => (
          <a
            key={tag.id}
            href={`#${tag.id}`}
            className={"text-sm p-3 text-gray-600 whitespace-nowrap"}
          >
            {tag.label}
          </a>
        ))}
      </div>
    </>
  );
}
