"use client";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
/**
 * 공연 상세 이미지 섹션 컴포넌트
 */

import Image from "next/image";
import { useState } from "react";

/**
 * 공연 상세 이미지 컴포넌트 속성
 */
interface PerformanceDetailImageProps {
  /** 이미지 URL */
  imageUrl?: string;
  /** 공연 제목 (alt 텍스트용) */
  title: string;
}

/**
 * 공연 상세 이미지를 표시하는 컴포넌트
 */
export function PerformanceDetailImage({
  imageUrl,
  title,
}: PerformanceDetailImageProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      id="image"
      className="performance-section scroll-mt-36 p-detail-wrapper"
    >
      <h3 className="text-lg font-semibold mb-2 py-3.5">상품 상세</h3>
      <div
        className={cn(
          "overflow-hidden transition-all relative h-full",
          expanded ? "max-h-none" : "max-h-[300px]",
        )}
      >
        <div className={"relative h-full overflow-hidden rounded-2xl"}>
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={`${title} 상세 설명 이미지`}
              className="w-full h-auto"
              width={800}
              height={2000}
              sizes="(max-width: 639px) calc(90vw - 40px), (max-width: 911px) calc(100vw - 16px), 880px"
              quality={100}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8VA8AAmkBc7YFeIIAAAAASUVORK5CYII="
            />
          )}
        </div>
        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-white/0 to-white"></div>
        )}
      </div>
      {/* 상품 상세 더보기 */}
      {!expanded && (
        <div className="mt-8 text-center">
          <Button
            className="w-full h-11"
            variant={"outline"}
            onClick={() => setExpanded(true)}
          >
            상품 상세 더보기
          </Button>
        </div>
      )}
    </section>
  );
}
