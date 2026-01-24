"use client";

import Image from "next/image";
import { CarouselItem } from "@/shared/ui/carousel";
import { ReusableCarousel } from "@/shared/ui/reusable-carousel";

/**
 * 공연 상세 이미지 캐러셀 컴포넌트 props
 */
interface PerformanceImageCarouselProps {
  /** 이미지 URL 배열 */
  images: string[];
  /** 공연 제목 (alt 텍스트용) */
  title: string;
}

/**
 * 공연 상세 이미지 캐러셀 컴포넌트
 */
export function PerformanceImageCarousel({
  images,
  title,
}: PerformanceImageCarouselProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="wrapper px-4 sm:px-10">
      <ReusableCarousel
        options={{
          autoplay: false,
          showNavigation: images.length > 1,
          showPageControls: false,
          showInternalPageInfo: true,
          loop: true,
          slidesToScroll: 1,
          align: "start",
        }}
      >
        {images.map((imageUrl, index) => (
          <CarouselItem key={imageUrl}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={imageUrl}
                alt={`${title} 이미지 ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 5rem), 800px"
                priority
              />
            </div>
          </CarouselItem>
        ))}
      </ReusableCarousel>
    </div>
  );
}
