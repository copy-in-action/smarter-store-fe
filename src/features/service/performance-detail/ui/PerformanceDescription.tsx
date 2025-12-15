/**
 * 공연 상세 설명 섹션 컴포넌트
 * FIXME: 실제론 이런 데이터는 없음 확인필요
 */

/**
 * 공연 설명 컴포넌트 속성
 */
interface PerformanceDescriptionProps {
  /** 공연 설명 */
  description?: string;
  /** 공연 제목 (fallback용) */
  title: string;
}

/**
 * 공연 상세 설명을 표시하는 컴포넌트
 */
export function PerformanceDescription({
  description,
  title,
}: PerformanceDescriptionProps) {
  return (
    <section
      id="description"
      className="scroll-mt-36 performance-section wrapper"
    >
      <h3 className="text-lg font-semibold mb-2 py-3.5">공연소개</h3>

      {description ? (
        <p className="leading-relaxed whitespace-pre-wrap">{description}</p>
      ) : (
        <p className="text-gray-500">
          {title}에 대한 상세 정보가 준비중입니다.
        </p>
      )}
    </section>
  );
}
