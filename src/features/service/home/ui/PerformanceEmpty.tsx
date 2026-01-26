/**
 * 공연 목록 빈 상태 컴포넌트
 * 공연 데이터가 없을 때 표시되는 공통 컴포넌트
 */
export function PerformanceEmpty() {
  return (
    <div className="px-4 wrapper sm:px-10!">
      <div className="flex items-center justify-center py-10">
        <div className="text-gray-500">등록된 공연이 없습니다.</div>
      </div>
    </div>
  );
}
