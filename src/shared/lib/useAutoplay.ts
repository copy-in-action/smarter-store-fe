import { useCallback, useEffect, useState } from "react";
import type { CarouselApi } from "@/shared/ui/carousel";

/**
 * 자동재생 훅 반환 타입
 */
type UseAutoplayType = {
  /** 자동재생 상태 */
  autoplayIsPlaying: boolean;
  /** 자동재생 토글 함수 */
  toggleAutoplay: () => void;
  /** 자동재생 버튼 클릭 핸들러 */
  onAutoplayButtonClick: (callback: () => void) => void;
};

/**
 * 캐러셀 자동재생을 관리하는 커스텀 훅
 * @param emblaApi - Embla Carousel API 인스턴스
 * @returns 자동재생 상태와 제어 함수들
 */
export const useAutoplay = (
  emblaApi: CarouselApi | undefined,
): UseAutoplayType => {
  const [autoplayIsPlaying, setAutoplayIsPlaying] = useState(false);

  /**
   * 자동재생 버튼 클릭 시 실행할 콜백 함수
   * @param callback - 실행할 콜백 함수
   */
  const onAutoplayButtonClick = useCallback(
    (callback: () => void) => {
      const autoplay = emblaApi?.plugins()?.autoplay;
      if (!autoplay) return;

      const resetOrStop =
        autoplay.options.stopOnInteraction === false
          ? autoplay.reset
          : autoplay.stop;

      resetOrStop();
      callback();
    },
    [emblaApi],
  );

  /**
   * 자동재생을 토글하는 함수
   */
  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play;
    playOrStop();
  }, [emblaApi]);

  /**
   * 자동재생 상태를 감지하고 업데이트하는 이펙트
   */
  useEffect(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    setAutoplayIsPlaying(autoplay.isPlaying());

    emblaApi
      .on("autoplay:play", () => setAutoplayIsPlaying(true))
      .on("autoplay:stop", () => setAutoplayIsPlaying(false))
      .on("reInit", () => setAutoplayIsPlaying(autoplay.isPlaying()));

    return () => {
      emblaApi?.off("autoplay:play", () => setAutoplayIsPlaying(true));
      emblaApi?.off("autoplay:stop", () => setAutoplayIsPlaying(false));
      emblaApi?.off("reInit", () => setAutoplayIsPlaying(autoplay.isPlaying()));
    };
  }, [emblaApi]);

  return {
    autoplayIsPlaying,
    toggleAutoplay,
    onAutoplayButtonClick,
  };
};
