/**
 * 공연 목록 빈 상태 컴포넌트
 * 공연 데이터가 없을 때 표시되는 공통 컴포넌트
 * - 스켈레톤과 동일한 높이를 유지하여 레이아웃 시프트 방지
 */
export function PerformanceEmpty() {
  return (
    <div className="px-4 wrapper sm:px-10!">
      <div className="relative flex gap-4">
        {/* 스켈레톤과 동일한 높이 유지를 위한 투명 카드 */}
        <div className="space-y-3 basis-2/5 sm:basis-3/10 lg:basis-3/13 invisible">
          <div className="aspect-[3/4]" />
          <div className="space-y-1">
            <div className="h-4" />
            <div className="h-3" />
          </div>
        </div>
        {/* 빈 상태 메시지 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">등록된 공연이 없습니다.</div>
        </div>
      </div>
    </div>
  );
}
