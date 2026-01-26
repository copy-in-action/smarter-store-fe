/**
 * 홈 섹션 리스트 로딩 스켈레톤 컴포넌트
 */

/**
 * 섹션 블록 스켈레톤
 */
function SectionBlockSkeleton() {
  return (
    <div className="space-y-6">
      {/* 섹션 제목 스켈레톤 */}
      <div className="h-7 bg-gray-200 rounded animate-pulse w-32" />

      {/* 탭 스켈레톤 */}
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i.toString()}
            className="h-6 bg-gray-200 rounded animate-pulse w-20"
          />
        ))}
      </div>

      {/* 공연 카드 스켈레톤 */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i.toString()}
            className="space-y-3 basis-2/5 sm:basis-3/10 lg:basis-3/13"
          >
            <div className="aspect-[3/4] bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 홈 섹션 리스트 전체 스켈레톤
 * 2개의 섹션 블록 스켈레톤을 표시합니다
 */
export function SectionListSkeleton() {
  return (
    <div className="px-4 wrapper sm:px-10 space-y-12 sm:space-y-20">
      {Array.from({ length: 2 }).map((_, i) => (
        <SectionBlockSkeleton key={i.toString()} />
      ))}
    </div>
  );
}
