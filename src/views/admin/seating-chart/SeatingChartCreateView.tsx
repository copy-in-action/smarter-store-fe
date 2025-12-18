import type { SeatingChartPageProps } from "@/features/admin/seating-chart";
import {
  fetchSeatingChartOnServer,
  SeatingChartManager,
} from "@/features/admin/seating-chart";

/**
 * 좌석 배치도 생성 뷰 컴포넌트
 * @param props - 좌석 배치도 페이지 속성
 */
export default async function SeatingChartCreateView({
  venueId,
  name,
}: SeatingChartPageProps) {
  const venueIdNumber = Number(venueId);

  if (isNaN(venueIdNumber)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            잘못된 공연장 ID
          </h1>
          <p className="text-gray-600">올바른 공연장 ID를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  // 서버사이드에서 기존 좌석 배치도 데이터 조회
  const initialSeatingChart = await fetchSeatingChartOnServer(venueIdNumber);

  return (
    <SeatingChartManager
      venueId={venueIdNumber}
      venueName={name}
      initialData={initialSeatingChart}
    />
  );
}
