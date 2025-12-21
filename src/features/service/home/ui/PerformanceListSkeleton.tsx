/**
 * 공연 리스트 로딩 스켈레톤 컴포넌트
 */
export function PerformanceListSkeleton() {
  return (
    <div className="px-4 wrapper sm:px-10">
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
