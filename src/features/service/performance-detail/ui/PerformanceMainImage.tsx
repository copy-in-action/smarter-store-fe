"use client";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
/**
 * 공연 메인 이미지 섹션 컴포넌트
 */

import Image from "next/image";
import { useState } from "react";

/**
 * 공연 메인 이미지 컴포넌트 속성
 */
interface PerformanceMainImageProps {
  /** 이미지 URL */
  imageUrl?: string;
  /** 공연 제목 (alt 텍스트용) */
  title: string;
}

/**
 * 공연 메인 이미지를 표시하는 컴포넌트
 */
export function PerformanceMainImage({
  imageUrl,
  title,
}: PerformanceMainImageProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section id="image" className="performance-section scroll-mt-36 wrapper">
      <h3 className="text-lg font-semibold mb-2 py-3.5">상품상세</h3>
      <div
        className={cn(
          "overflow-hidden transition-all relative",
          expanded ? "max-h-none" : "max-h-[400px]",
        )}
      >
        <div className={"relative aspect-[3/4]"}>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={`${title} 포스터`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
              loading="eager"
              unoptimized
            />
          )}
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-white/0 to-white"></div>
        )}
      </div>
      {/* 상품 상세 더보기 */}
      {!expanded && (
        <div className="mt-5 text-center">
          <Button
            className="w-4/6 h-11"
            variant={"outline"}
            onClick={() => setExpanded(true)}
          >
            상품 상세 더보기
          </Button>
        </div>
      )}
      <div></div>
    </section>
  );
}
