"use client";

import Autoplay from "embla-carousel-autoplay";
import { Pause, Play, Plus } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useAutoplay } from "@/shared/lib/hooks/useAutoplay";
import {
  NextButton,
  PrevButton,
  usePrevNextButtons,
} from "@/shared/lib/hooks/usePrevNextButtons";
import { Button } from "@/shared/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/shared/ui/carousel";

import { banners } from "../model";

/**
 * 메인 배너 캐러셀 컴포넌트
 */
const MainBanner = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const { autoplayIsPlaying, toggleAutoplay } = useAutoplay(api);

  /**
   * 버튼 클릭 시 autoplay delay 초기화
   */
  const handleButtonClick = (api: CarouselApi) => {
    if (!api) return;
    // Autoplay 플러그인의 reset 메서드 호출하여 delay 초기화
    const autoplayPlugin = api.plugins().autoplay;
    if (autoplayPlugin) {
      autoplayPlugin.reset();
    }
  };

  const { onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(
    api,
    handleButtonClick,
  );

  /**
   * Carousel API 설정 및 상태 업데이트
   */
  const handleApiChange = (api: CarouselApi) => {
    setApi(api);

    if (!api) {
      return;
    }

    /**
     * 초기 count 및 current 설정
     */
    const updateCarouselState = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap() + 1);
    };

    updateCarouselState();

    /**
     * select 이벤트: 슬라이드 변경 시
     */
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    /**
     * reInit 이벤트: breakpoint 변경 시 carousel 재초기화
     */
    api.on("reInit", updateCarouselState);
  };

  return (
    <div className="wrapper pe-0 ps-2 sm:px-10">
      <div className="relative">
        {/* 화살표 네비게이션 버튼 */}
        <div className="absolute z-10 hidden w-full sm:block h-hull top-1/2 ">
          <PrevButton onClick={onPrevButtonClick} />
          <NextButton onClick={onNextButtonClick} />
        </div>

        <Carousel
          setApi={handleApiChange}
          opts={{
            align: "start",
            loop: true,
            slidesToScroll: 1,
            breakpoints: {
              "(min-width: 1024px)": { slidesToScroll: 2 },
            },
          }}
          plugins={[
            Autoplay({
              delay: 2500,
              stopOnInteraction: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-2 lg:-ml-4">
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
          </CarouselContent>
        </Carousel>
      </div>

      {/* 하단 컨트롤러 */}
      <div className="flex items-center justify-center gap-4 mx-auto mt-4 md:mt-4 w-96 max-w-4/5">
        {/* 재생/일시정지 버튼 */}
        <Button
          variant="ghost"
          className="p-0! h-auto"
          onClick={() => toggleAutoplay()}
        >
          {autoplayIsPlaying ? (
            <Pause className="w-3 h-3 fill-black" />
          ) : (
            <Play className="w-3 h-3 fill-black" />
          )}
        </Button>

        {/* 페이지 인디케이터 */}
        {count && (
          <div className="relative w-full h-1">
            <div className="absolute w-full h-[2px] top-[1px] bg-gray-300" />
            <div
              ref={progressRef}
              className={`absolute h-1 bg-black rounded-full transition-all duration-300 ${"animate-progress"}`}
              style={{
                width: `calc(100% / ${count})`,
                left: `calc( ${current - 1} / ${count} * 100% )`,
              }}
            />
          </div>
        )}

        {/* 페이지 번호 */}
        <Button
          className="px-2! py-1! text-xs font-medium text-center rounded-4xl gap-0 h-auto"
          variant={"secondary"}
        >
          <span className="font-bold">{String(current).padStart(2, "0")}</span>
          <span className="mx-0.5">/</span>
          {String(count).padStart(2, "0")}
          <Plus className="stroke-1" />
        </Button>
      </div>
    </div>
  );
};

export default MainBanner;
