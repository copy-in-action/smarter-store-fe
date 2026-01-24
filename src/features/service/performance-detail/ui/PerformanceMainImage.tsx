// TODO: 추후 캐러샐로 변경 필요. 현재는 이미지가 하나이므로 추후 구현

"use client";
/**
 * 공연 메인 이미지 섹션 컴포넌트
 */

import Image from "next/image";

/**
 * 공연 메인 이미지 컴포넌트 속성
 */
interface PerformanceMainProps {
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
}: PerformanceMainProps) {
  return (
    <section className="p-detail-wrapper">
      <div className="relative flex items-center justify-center overflow-hidden rounded-3xl sm:h-[285px]">
        {imageUrl && (
          <>
            {/** biome-ignore lint/performance/noImgElement: <explanation> */}
            <img
              src={imageUrl}
              alt={`${title} 포스터`}
              className="inset-0 object-fill h-full aspect-[343/286] sm:aspect-[558/285]"
              aria-hidden
              width={"100%"}
              sizes="(max-width: 916px) 100vw, 880px"
              fetchPriority="high"
            />
            <div className="absolute inset-0 backdrop-blur-[50px]" />

            <div className="absolute h-[78%]">
              <div className="relative z-10 aspect-[158/223] h-full">
                <Image
                  src={imageUrl}
                  alt={`${title} 포스터`}
                  className="rounded-2xl"
                  fill
                  sizes="(max-width: 640px) 70vw, 160px"
                  priority
                />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
