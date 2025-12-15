/**
 * 공연 제목 섹션 컴포넌트
 */

/**
 * 공연 제목 컴포넌트 속성
 */
interface PerformanceTitleProps {
  /** 공연 제목 */
  title: string;
}

/**
 * 공연 제목과 카테고리를 표시하는 컴포넌트
 */
export function PerformanceTitle({ title }: PerformanceTitleProps) {
  return <h1 className="my-5 text-[20px] font-bold wrapper">{title}</h1>;
}
