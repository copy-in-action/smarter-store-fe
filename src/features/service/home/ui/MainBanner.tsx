"use client";

import Image from "next/image";
import { CarouselItem } from "@/shared/ui/carousel";
import { ReusableCarousel } from "@/shared/ui/reusable-carousel";

import { banners } from "../model";

/**
 * 메인 배너 캐러셀 컴포넌트
 */
const MainBanner = () => {
  return (
    <div className="wrapper pe-0 ps-2 sm:px-10">
      <ReusableCarousel
        options={{
          autoplay: true,
          autoplayDelay: 2500,
          showNavigation: true,
          showPageControls: true,
          loop: true,
          slidesToScroll: 1,
          align: "start",
          breakpoints: {
            "(min-width: 1024px)": { slidesToScroll: 2 },
          },
        }}
        contentClassName="-ml-2 lg:-ml-4"
      >
        {banners.map((banner) => (
          <CarouselItem
            key={banner.id}
            className="pl-2 lg:pl-4 basis-11/12 sm:basis-8/12 lg:basis-1/2"
          >
            <div className="relative aspect-[5/2] overflow-hidden rounded-2xl max-w-[632px]">
              <Image
                src={banner.posterImage}
                alt={`Banner${banner.id}`}
                fill
                className="object-contain"
              />
            </div>
          </CarouselItem>
        ))}
      </ReusableCarousel>
    </div>
  );
};

export default MainBanner;
