import SeatingChartView from "@/views/admin/seating-chart/SeatingChartView";

/**
 * 좌석 배치도 설정 페이지
 * @param searchParams - URL 쿼리 파라미터
 */
export default async function SeatPage({
  searchParams,
}: {
  searchParams: Promise<{ venueId?: string; name?: string }>;
}) {
  const { venueId, name } = await searchParams;

  // 필수 파라미터 검증
  if (!venueId || !name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">잘못된 접근</h1>
          <p className="text-gray-600">공연장 ID와 이름이 필요합니다.</p>
        </div>
      </div>
    );
  }

  return <SeatingChartView venueId={venueId} name={name} />;
}
