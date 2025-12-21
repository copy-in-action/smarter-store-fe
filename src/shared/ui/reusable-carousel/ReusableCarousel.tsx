"use client";

import Autoplay from "embla-carousel-autoplay";
import { Pause, Play, Plus } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
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
} from "@/shared/ui/carousel";

/**
 * 재사용 가능한 캐러셀 컴포넌트의 옵션 인터페이스
 */
interface ReusableCarouselOptions {
  /** 자동재생 사용 여부 (기본: false) */
  autoplay?: boolean;
  /** 자동재생 지연시간 (ms, 기본: 2500) */
  autoplayDelay?: number;
  /** 네비게이션 버튼 표시 여부 (기본: true) */
  showNavigation?: boolean;
  /** 페이지 컨트롤러 표시 여부 (기본: false) */
  showPageControls?: boolean;
  /** 내부 페이지 표시 여부 (기본: false) */
  showInternalPageInfo?: boolean;
  /** 루프 재생 여부 (기본: true) */
  loop?: boolean;
  /** 한 번에 스크롤할 슬라이드 수 (기본: 1) */
  slidesToScroll?: number;
  /** 정렬 방식 (기본: "start") */
  align?: "start" | "center" | "end";
  /** 반응형 브레이크포인트 옵션 */
  breakpoints?: Record<string, { slidesToScroll?: number }>;
}

/**
 * 재사용 가능한 캐러셀 컴포넌트 props
 */
interface ReusableCarouselProps {
  /** 캐러셀 내용 */
  children: ReactNode;
  /** 캐러셀 옵션 */
  options?: ReusableCarouselOptions;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 캐러셀 콘텐츠 추가 CSS 클래스 */
  contentClassName?: string;
  /** 네비게이션 버튼 추가 CSS 클래스 */
  navigationButtonClassName?: string;
}

/**
 * 재사용 가능한 캐러셀 컴포넌트
 */
export function ReusableCarousel({
  children,
  options = {},
  className = "",
  contentClassName = "",
  navigationButtonClassName = "",
}: ReusableCarouselProps) {
  const {
    autoplay = false,
    autoplayDelay = 2500,
    showNavigation = true,
    showPageControls = false,
    showInternalPageInfo = false,
    loop = true,
    slidesToScroll = 1,
    align = "start",
    breakpoints = {},
  } = options;

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const { autoplayIsPlaying, toggleAutoplay } = useAutoplay(api);

  /**
   * 버튼 클릭 시 autoplay delay 초기화
   */
  const handleButtonClick = (api: CarouselApi) => {
    if (!api || !autoplay) return;
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

  const plugins = autoplay
    ? [
        Autoplay({
          delay: autoplayDelay,
          stopOnInteraction: true,
        }),
      ]
    : [];

  return (
    <div className="relative">
      <Carousel
        setApi={handleApiChange}
        opts={{
          align,
          loop,
          slidesToScroll,
          breakpoints,
        }}
        plugins={plugins}
        className={`w-full ${className}`}
      >
        {/* 화살표 네비게이션 버튼 */}
        {showNavigation && (
          <>
            <PrevButton
              className={navigationButtonClassName}
              onClick={onPrevButtonClick}
            />
            <NextButton
              className={navigationButtonClassName}
              onClick={onNextButtonClick}
            />
          </>
        )}
        <CarouselContent className={contentClassName}>
          {children}
        </CarouselContent>
      </Carousel>

      {/* 하단 컨트롤러 */}
      {showPageControls && (
        <div className="flex items-center justify-center gap-4 mx-auto mt-4 md:mt-4 w-96 max-w-4/5">
          {/* 재생/일시정지 버튼 */}
          {autoplay && (
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
          )}

          {/* 페이지 인디케이터 */}
          {count && (
            <div className="relative w-full h-1">
              <div className="absolute w-full h-[2px] top-[1px] bg-gray-300" />
              <div
                ref={progressRef}
                className={`absolute h-1 bg-black rounded-full transition-all duration-300 ${autoplay ? "animate-progress" : ""}`}
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
            <span className="font-bold">
              {String(current).padStart(2, "0")}
            </span>
            <span className="mx-0.5">/</span>
            {String(count).padStart(2, "0")}
            <Plus className="stroke-1" />
          </Button>
        </div>
      )}

      {/* 내부 페이지 정보 (이미지 오른쪽 아래) */}
      {showInternalPageInfo && count > 1 && (
        <div className="absolute z-10 bottom-4 right-4">
          <div className="px-2 py-1 text-sm text-white rounded bg-black/50">
            {current}/{count}
          </div>
        </div>
      )}
    </div>
  );
}
