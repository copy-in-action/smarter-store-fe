import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type PropsWithChildren,
  useCallback,
} from "react";
import type { CarouselApi } from "@/shared/ui/carousel";
import { cn } from "./utils";

/**
 * 이전/다음 버튼 훅 반환 타입
 */
type UsePrevNextButtonsType = {
  /** 이전 버튼 클릭 핸들러 */
  onPrevButtonClick: () => void;
  /** 다음 버튼 클릭 핸들러 */
  onNextButtonClick: () => void;
};

/**
 * 캐러셀 이전/다음 버튼을 관리하는 커스텀 훅
 * @param emblaApi - Embla Carousel API 인스턴스
 * @param onButtonClick - 버튼 클릭 시 실행할 콜백 함수
 * @returns 버튼 상태와 클릭 핸들러들
 */
export const usePrevNextButtons = (
  emblaApi: CarouselApi | undefined,
  onButtonClick?: (emblaApi: CarouselApi) => void,
): UsePrevNextButtonsType => {
  /**
   * 이전 버튼 클릭 핸들러
   */
  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    if (onButtonClick) onButtonClick(emblaApi);
  }, [emblaApi, onButtonClick]);

  /**
   * 다음 버튼 클릭 핸들러
   */
  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    if (onButtonClick) onButtonClick(emblaApi);
  }, [emblaApi, onButtonClick]);

  return {
    onPrevButtonClick,
    onNextButtonClick,
  };
};

/**
 * 버튼 컴포넌트 Props 타입
 */
type ButtonProps = PropsWithChildren<
  ComponentPropsWithRef<"button"> & HTMLAttributes<HTMLButtonElement>
>;

/**
 * 이전 버튼 컴포넌트
 */
export const PrevButton = ({ children, ...restProps }: ButtonProps) => {
  const { className } = restProps;
  return (
    <button
      type="button"
      {...restProps}
      className={cn(
        "absolute z-10 items-center justify-center hidden text-gray-700 transition-all -translate-y-1/2 bg-white border rounded-lg shadow-lg sm:flex top-1/2 size-12 -left-6 hover:bg-gray-50 hover:text-gray-950",
        className,
      )}
    >
      <ChevronLeft className="w-6 h-6" />
      {children}
    </button>
  );
};

/**
 * 다음 버튼 컴포넌트
 */
export const NextButton = ({ children, ...restProps }: ButtonProps) => {
  const { className } = restProps;
  return (
    <button
      type="button"
      {...restProps}
      className={cn(
        "absolute z-10 items-center justify-center hidden text-gray-700 transition-all -translate-y-1/2 bg-white border rounded-lg shadow-lg sm:flex top-1/2 size-12 -right-6 hover:bg-gray-50 hover:text-gray-950",
        className,
      )}
    >
      <ChevronRight className="w-6 h-6" />
      {children}
    </button>
  );
};
